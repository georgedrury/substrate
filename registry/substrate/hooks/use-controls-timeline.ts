"use client"

import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from "react"
import { DialStore, type DialKitPersistOptions } from "dialkit/store"
import {
	TimelineStore,
	buildTimelineMeta,
	buildTimelineValues,
	computeStaticTimeline,
	parseTimelineConfig,
	resolveTimelineLoop,
	type DialTimelineValues,
	type TimelineConfig,
} from "dialkit/timeline"

// Animation clips defined in code, edited in <ControlsTimeline />. The clip
// model and playback come from DialKit's headless timeline (MIT, © Josh
// Puckett); this hook follows its useDialTimeline lifecycle.

type UseControlsTimelineOptions = {
	/** Keep values across unmounts, and share them between mounts using the same id */
	id?: string
	/** Save values to browser storage; pass an object to choose the key or storage */
	persist?: DialKitPersistOptions
	/** Start playing on mount. Defaults to true. */
	autoplay?: boolean
	/**
	 * Loop at the end. `true` restarts the whole timeline; `{ from }` wraps back
	 * to that time, so clips before it play once. Defaults to false.
	 */
	loop?: boolean | { from: number }
}

function useControlsTimeline<T extends TimelineConfig>(
	name: string,
	config: T,
	options: UseControlsTimelineOptions = {},
): DialTimelineValues<T> {
	const instanceId = useId()
	const hasStableId = options.id !== undefined
	const panelId = options.id ?? `${name}-${instanceId}`

	const serializedConfig = JSON.stringify(config)
	const parsed = useMemo(
		() => parseTimelineConfig(config),
		// The serialized config decides when to re-parse, so inline objects are fine
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[serializedConfig],
	)

	// Clip values (start, length, from, to, curves) live in DialKit's store as
	// a timeline panel, so versions, persistence and the editor all share them
	const parsedRef = useRef(parsed)
	const persistRef = useRef(options.persist)
	const autoplayRef = useRef(options.autoplay)
	useEffect(() => {
		parsedRef.current = parsed
		persistRef.current = options.persist
		autoplayRef.current = options.autoplay
	})

	useEffect(() => {
		DialStore.registerPanel(panelId, name, parsedRef.current.dialConfig, undefined, {
			retainOnUnmount: hasStableId,
			persist: persistRef.current,
			kind: "timeline",
		})
		return () => DialStore.unregisterPanel(panelId)
	}, [hasStableId, panelId, name])

	const registered = useRef(false)
	useEffect(() => {
		if (!registered.current) {
			registered.current = true
			return
		}
		DialStore.updatePanel(panelId, name, parsed.dialConfig, undefined, {
			retainOnUnmount: hasStableId,
			persist: persistRef.current,
			kind: "timeline",
		})
	}, [hasStableId, panelId, name, parsed])

	const flatValues = useSyncExternalStore(
		(listener) => DialStore.subscribe(panelId, listener),
		() => DialStore.getValues(panelId),
		() => DialStore.getValues(panelId),
	)

	const { duration, clips } = useMemo(
		() => computeStaticTimeline(parsed, flatValues),
		[parsed, flatValues],
	)

	const { enabled: loopEnabled, start: loopStart } = resolveTimelineLoop(options.loop)
	const meta = useMemo(
		() =>
			buildTimelineMeta(
				panelId,
				name,
				duration,
				parsed,
				loopEnabled ? { from: loopStart } : false,
			),
		[panelId, name, duration, parsed, loopEnabled, loopStart],
	)

	const metaRef = useRef(meta)
	useEffect(() => {
		metaRef.current = meta
	})

	useEffect(() => {
		TimelineStore.register(metaRef.current, {
			autoplay: autoplayRef.current ?? true,
		})
		return () => TimelineStore.unregister(panelId)
	}, [panelId, name])

	const playbackRegistered = useRef(false)
	useEffect(() => {
		if (!playbackRegistered.current) {
			playbackRegistered.current = true
			return
		}
		TimelineStore.update(meta)
	}, [meta])

	const transport = useSyncExternalStore(
		(listener) => TimelineStore.subscribe(panelId, listener),
		() => TimelineStore.getTransport(panelId),
		() => TimelineStore.getTransport(panelId),
	)

	const actions = useMemo(
		() => ({
			play: () => TimelineStore.play(panelId),
			pause: () => TimelineStore.pause(panelId),
			replay: () => TimelineStore.replay(panelId),
			seek: (time: number) => TimelineStore.seek(panelId, time),
		}),
		[panelId],
	)

	return useMemo(
		() => buildTimelineValues<T>(clips, transport, duration, loopStart, actions),
		[clips, transport, duration, loopStart, actions],
	)
}

export { useControlsTimeline, type UseControlsTimelineOptions }
export type { TimelineConfig as ControlsTimelineConfig } from "dialkit/timeline"
