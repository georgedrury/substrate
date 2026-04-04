"use client"

import { toast as sonnerToast } from "sonner"

// ── Thin wrapper around sonner with creative-app defaults ──

type ToastOptions = {
	description?: string
	duration?: number
	action?: {
		label: string
		onClick: () => void
	}
}

function toast(message: string, options?: ToastOptions) {
	return sonnerToast(message, {
		duration: options?.duration ?? 3000,
		description: options?.description,
		action: options?.action
			? { label: options.action.label, onClick: options.action.onClick }
			: undefined,
	})
}

toast.success = (message: string, options?: ToastOptions) =>
	sonnerToast.success(message, {
		duration: options?.duration ?? 3000,
		description: options?.description,
	})

toast.error = (message: string, options?: ToastOptions) =>
	sonnerToast.error(message, {
		duration: options?.duration ?? 5000,
		description: options?.description,
	})

toast.info = (message: string, options?: ToastOptions) =>
	sonnerToast.info(message, {
		duration: options?.duration ?? 3000,
		description: options?.description,
	})

toast.warning = (message: string, options?: ToastOptions) =>
	sonnerToast.warning(message, {
		duration: options?.duration ?? 4000,
		description: options?.description,
	})

toast.undo = (message: string, onUndo: () => void) =>
	sonnerToast(message, {
		duration: 5000,
		action: { label: "Undo", onClick: onUndo },
	})

toast.dismiss = sonnerToast.dismiss

export { toast }
