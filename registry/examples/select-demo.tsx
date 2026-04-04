"use client"

import { Action, ActionLabel, ActionControls } from "@/registry/substrate/components/action"
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectGroup,
	SelectLabel,
	SelectValue,
} from "@/registry/substrate/components/select"

export default function SelectDemo() {
	return (
		<div className="w-[260px] space-y-2">
			<Action>
				<ActionLabel>Blend</ActionLabel>
				<ActionControls>
					<Select defaultValue="normal">
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Normal</SelectLabel>
								<SelectItem value="normal">Normal</SelectItem>
								<SelectItem value="dissolve">Dissolve</SelectItem>
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Darken</SelectLabel>
								<SelectItem value="darken">Darken</SelectItem>
								<SelectItem value="multiply">Multiply</SelectItem>
								<SelectItem value="color-burn">Colour burn</SelectItem>
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Lighten</SelectLabel>
								<SelectItem value="lighten">Lighten</SelectItem>
								<SelectItem value="screen">Screen</SelectItem>
								<SelectItem value="color-dodge">Colour dodge</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</ActionControls>
			</Action>
		</div>
	)
}
