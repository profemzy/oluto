import toast from "react-hot-toast";

export const toastError = (message: string) => {
  toast.error(message);
};

export const toastSuccess = (message: string) => {
  toast.success(message);
};

export const toastInfo = (message: string) => {
  toast(message);
};

export const toastPromise = (
  promise: Promise<unknown>,
  loadingMessage: string,
  successMessage: string,
  errorMessage: string = "Something went wrong",
) => {
  return toast.promise(promise, {
    loading: loadingMessage,
    success: successMessage,
    error: errorMessage,
  });
};
