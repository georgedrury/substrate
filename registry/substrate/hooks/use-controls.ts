"use client"

import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from "react"
import {
	DialStore,
	resolveDialValues,
	type DialConfig,
	type DialKitPersistOptions,
	type ResolvedValues,
} from "dialkit/store"

// The config format and store come from DialKit (https://github.com/joshpuckett/dialkit,
// MIT, © Josh Puckett). This hook follows its useDialStorePanel lifecycle; the
// controls themselves are rendered by Substrate's <Controls />.

type UseControlsOptions = {
	/** Keep values across unmounts, and share them between mounts using the same id */
	id?: string
	/** Save values to browser storage; pass an object to choose the key or storage */
	persist?: DialKitPersistOptions
	/** Called with the path of a clicked action control, such as "replay" */
	onAction?: (path: string) => void
}

function useControls<T extends DialConfig>(
	name: string,
	config: T,
	options: UseControlsOptions = {},
): ResolvedValues<T> {
	const instanceId = useId()
	const hasStableId = options.id !== undefined
	const panelId = options.id ?? `${name}-${instanceId}`

	// Refs keep the effects below from re-running when the caller passes a
	// fresh object each render; the serialized config decides when to update.
	const configRef = useRef(config)
	configRef.current = config
	const persistRef = useRef(options.persist)
	persistRef.current = options.persist
	const onActionRef = useRef(options.onAction)
	onActionRef.current = options.onAction

	const serializedConfig = JSON.stringify(config)
	const serializedPersist = JSON.stringify(options.persist)

	useEffect(() => {
		DialStore.registerPanel(panelId, name, configRef.current, undefined, {
			retainOnUnmount: hasStableId,
			persist: persistRef.current,
		})
		return () => DialStore.unregisterPanel(panelId)
	}, [hasStableId, panelId, name])

	// Push config edits without re-registering, which would reset the values
	const mounted = useRef(false)
	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}
		DialStore.updatePanel(panelId, name, configRef.current, undefined, {
			retainOnUnmount: hasStableId,
			persist: persistRef.current,
		})
	}, [hasStableId, panelId, name, serializedConfig, serializedPersist])

	useEffect(
		() => DialStore.subscribeActions(panelId, (path) => onActionRef.current?.(path)),
		[panelId],
	)

	const flatValues = useSyncExternalStore(
		(listener) => DialStore.subscribe(panelId, listener),
		() => DialStore.getValues(panelId),
		() => DialStore.getValues(panelId),
	)

	return useMemo(
		() => resolveDialValues(configRef.current, flatValues),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[flatValues, serializedConfig],
	)
}

export { useControls, type UseControlsOptions }
export type { DialConfig as ControlsConfig, ResolvedValues as ControlsValues } from "dialkit/store"
