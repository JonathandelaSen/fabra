"use client";

import {
  applyCVProfileCopyPaste,
  prepareCVProfileCopyPaste,
  previewCVProfileCopyPaste,
} from "../api/cv-profile-copy-paste-api";

export function useCVProfileCopyPaste() {
  return {
    prepareCVProfileCopyPaste,
    previewCVProfileCopyPaste,
    applyCVProfileCopyPaste,
  };
}
