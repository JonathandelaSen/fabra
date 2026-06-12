"use client";
import { useMutation } from "@tanstack/react-query";
import { submitPublicCVFeedback } from "../api/public-cv-api";
export const useSubmitPublicCVFeedback = (publicId: string) => useMutation({ mutationFn: (input: Record<string, FormDataEntryValue>) => submitPublicCVFeedback(publicId, input) });
