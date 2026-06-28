import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb, getFirebaseAuth } from "./firebase";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const authInstance = getFirebaseAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance.currentUser?.uid || null,
      email: authInstance.currentUser?.email || null,
      emailVerified: authInstance.currentUser?.emailVerified || null,
      isAnonymous: authInstance.currentUser?.isAnonymous || null,
      tenantId: authInstance.currentUser?.tenantId || null,
      providerInfo:
        authInstance.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type PlanRecord = {
  id?: string;
  userId: string;
  task: string;
  deadline: string;
  dailyHours: string;
  blocker: string;
  planMarkdown: string;
  status: "active" | "completed" | "replanned";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export async function savePlan(
  plan: Omit<PlanRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const path = "plans";
  try {
    const ref = await addDoc(collection(getFirebaseDb(), path), {
      ...plan,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserPlans(userId: string): Promise<PlanRecord[]> {
  const path = "plans";
  try {
    const q = query(
      collection(getFirebaseDb(), path),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const plans = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as PlanRecord[];

    return plans.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getPlan(planId: string): Promise<PlanRecord | null> {
  const path = `plans/${planId}`;
  try {
    const snap = await getDoc(doc(getFirebaseDb(), "plans", planId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as PlanRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updatePlanMarkdown(
  planId: string,
  planMarkdown: string,
  status: PlanRecord["status"] = "replanned"
): Promise<void> {
  const path = `plans/${planId}`;
  try {
    await updateDoc(doc(getFirebaseDb(), "plans", planId), {
      planMarkdown,
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updatePlanInDb(
  planId: string,
  data: {
    planMarkdown: string;
    blocker?: string;
    status?: PlanRecord["status"];
  }
): Promise<void> {
  const path = `plans/${planId}`;
  try {
    await updateDoc(doc(getFirebaseDb(), "plans", planId), {
      planMarkdown: data.planMarkdown,
      status: data.status ?? "replanned",
      updatedAt: serverTimestamp(),
      ...(data.blocker !== undefined ? { blocker: data.blocker } : {}),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: Timestamp;
};

export async function saveChatMessage(
  planId: string,
  userId: string,
  message: ChatMessage
): Promise<void> {
  const path = `plans/${planId}/messages`;
  try {
    await addDoc(collection(getFirebaseDb(), "plans", planId, "messages"), {
      ...message,
      userId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getChatMessages(
  planId: string
): Promise<(ChatMessage & { id: string })[]> {
  const path = `plans/${planId}/messages`;
  try {
    const q = query(
      collection(getFirebaseDb(), "plans", planId, "messages"),
      orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as (ChatMessage & { id: string })[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export type HabitRecord = {
  id?: string;
  userId: string;
  name: string;
  streak: number;
  completedDates: string[]; // array of 'YYYY-MM-DD' dates
  createdAt?: Timestamp;
};

export async function saveHabit(
  habit: Omit<HabitRecord, "id" | "createdAt">
): Promise<string> {
  const path = "habits";
  try {
    const ref = await addDoc(collection(getFirebaseDb(), path), {
      ...habit,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserHabits(userId: string): Promise<HabitRecord[]> {
  const path = "habits";
  try {
    const q = query(
      collection(getFirebaseDb(), path),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as HabitRecord[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateHabitInDb(
  habitId: string,
  updates: Partial<Omit<HabitRecord, "id">>
): Promise<void> {
  const path = `habits/${habitId}`;
  try {
    await updateDoc(doc(getFirebaseDb(), "habits", habitId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteHabitInDb(habitId: string): Promise<void> {
  const path = `habits/${habitId}`;
  try {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(getFirebaseDb(), "habits", habitId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
