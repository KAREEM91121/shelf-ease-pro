import { useEffect } from "react";

interface UseAutoSaveProps<T> {
  data: T;
  key: string;
  delay?: number;
}

export const useAutoSave = <T,>({ data, key, delay = 1000 }: UseAutoSaveProps<T>) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`تم حفظ البيانات تلقائياً: ${key}`);
      } catch (error) {
        console.error("خطأ في الحفظ التلقائي:", error);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [data, key, delay]);
};

export const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("خطأ في تحميل البيانات:", error);
    return defaultValue;
  }
};