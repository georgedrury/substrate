"use client"

import {
	Timeline,
	TimelineRuler,
	TimelinePlayhead,
	TimelineTrack,
	TimelineKeyframe,
	TimelineTransport,
} from "@/registry/substrate/components/timeline"
import { useAnimationStore } from "@/registry/substrate/stores/animation-store"

export default function TimelineDemo() {
	const { duration, currentTime, zoomLevel } = useAnimationStore()

	return (
		<div className="w-full rounded-lg overflow-hidden border">
			<Timeline>
				<TimelineRuler duration={duration} zoomLevel={zoomLevel} />
				<div className="relative flex-1 overflow-y-auto">
					<TimelineTrack label="Position">
						<TimelineKeyframe time={0} duration={duration} zoomLevel={zoomLevel} />
						<TimelineKeyframe time={1.5} duration={duration} zoomLevel={zoomLevel} />
						<TimelineKeyframe time={3} duration={duration} zoomLevel={zoomLevel} />
					</TimelineTrack>
					<TimelineTrack label="Opacity">
						<TimelineKeyframe time={0} duration={duration} zoomLevel={zoomLevel} />
						<TimelineKeyframe time={2} duration={duration} zoomLevel={zoomLevel} />
						<TimelineKeyframe time={4.5} duration={duration} zoomLevel={zoomLevel} />
					</TimelineTrack>
					<TimelineTrack label="Scale">
						<TimelineKeyframe time={0.5} duration={duration} zoomLevel={zoomLevel} />
						<TimelineKeyframe time={3.5} duration={duration} zoomLevel={zoomLevel} />
					</TimelineTrack>
					<TimelinePlayhead time={currentTime} duration={duration} zoomLevel={zoomLevel} />
				</div>
				<TimelineTransport />
			</Timeline>
		</div>
	)
}
