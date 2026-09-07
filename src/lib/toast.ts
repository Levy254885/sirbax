export const toast = {
  success: (msg: string) => {
    if (typeof window !== "undefined") console.log("[toast success]", msg);
  },
  error: (msg: string) => {
    if (typeof window !== "undefined") console.error("[toast error]", msg);
  },
};
export default toast;
