/**
 * Spring physics helpers. A spring is described either by time (how long it
 * looks like it takes, and how much it overshoots) or by physics (stiffness,
 * damping and mass). Both resolve to the same damped harmonic oscillator.
 * The time-to-physics conversion matches Motion's visualDuration and bounce.
 */

export type TimeSpring = {
	type: "spring"
	/** Seconds the spring appears to take */
	visualDuration?: number
	/** 0 for no overshoot, 1 for a lot */
	bounce?: number
}

export type PhysicsSpring = {
	type: "spring"
	stiffness?: number
	damping?: number
	mass?: number
}

export type Spring = TimeSpring & PhysicsSpring

export type SpringMode = "time" | "physics"

export type SpringParams = {
	stiffness: number
	damping: number
	mass: number
}

export const DEFAULT_TIME_SPRING = {
	type: "spring",
	visualDuration: 0.3,
	bounce: 0.2,
} as const satisfies TimeSpring

export const DEFAULT_PHYSICS_SPRING = {
	type: "spring",
	stiffness: 200,
	damping: 25,
	mass: 1,
} as const satisfies PhysicsSpring

/** Physics mode when any physics field is set, time mode otherwise */
export function springMode(spring: Spring): SpringMode {
	return spring.stiffness !== undefined ||
		spring.damping !== undefined ||
		spring.mass !== undefined
		? "physics"
		: "time"
}

export function springParams(spring: Spring): SpringParams {
	if (springMode(spring) === "physics") {
		return {
			stiffness: spring.stiffness ?? DEFAULT_PHYSICS_SPRING.stiffness,
			damping: spring.damping ?? DEFAULT_PHYSICS_SPRING.damping,
			mass: spring.mass ?? DEFAULT_PHYSICS_SPRING.mass,
		}
	}
	const visualDuration = Math.max(
		0.05,
		spring.visualDuration ?? DEFAULT_TIME_SPRING.visualDuration,
	)
	const bounce = spring.bounce ?? DEFAULT_TIME_SPRING.bounce
	const root = (2 * Math.PI) / (visualDuration * 1.2)
	const stiffness = root * root
	const damping =
		2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(stiffness)
	return { stiffness, damping, mass: 1 }
}

/** Progress from 0 to 1 (overshooting when underdamped) at time t in seconds */
export function springProgress(
	t: number,
	{ stiffness, damping, mass }: SpringParams,
): number {
	if (t <= 0) return 0
	const w0 = Math.sqrt(stiffness / mass)
	const zeta = damping / (2 * Math.sqrt(stiffness * mass))

	if (zeta < 0.9999) {
		const wd = w0 * Math.sqrt(1 - zeta * zeta)
		return (
			1 -
			Math.exp(-zeta * w0 * t) *
				(Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
		)
	}
	if (zeta < 1.0001) {
		return 1 - Math.exp(-w0 * t) * (1 + w0 * t)
	}
	const wd = w0 * Math.sqrt(zeta * zeta - 1)
	const r1 = -zeta * w0 + wd
	const r2 = -zeta * w0 - wd
	return 1 + (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r1 - r2)
}

/** Seconds until the spring is within 0.5% of its target, clamped to 0.05–10 */
export function springSettleDuration({
	stiffness,
	damping,
	mass,
}: SpringParams): number {
	const w0 = Math.sqrt(stiffness / mass)
	const zeta = damping / (2 * Math.sqrt(stiffness * mass))
	const decay =
		zeta >= 1 ? zeta * w0 - w0 * Math.sqrt(Math.max(0, zeta * zeta - 1)) : zeta * w0
	const duration = Math.log(200) / Math.max(decay, 1e-6)
	return Math.min(10, Math.max(0.05, duration))
}
