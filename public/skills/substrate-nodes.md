---
name: substrate-nodes
description: "Substrate node graph system: node cards, typed ports, port colour theming, and node editor patterns. Use when building node-based editors, visual programming tools, shader graphs, or data flow UIs. Triggers on: node, port, graph, visual programming, shader graph, data flow, pipeline, wire, connection."
user-invocable: true
---

# Substrate nodes

The node system provides card-based nodes with typed ports, a CSS variable colour scheme for port types, and compound components for building node editor UIs.

## When to use this skill

Use the nodes skill when you need to:

- Build a node-based editor (shader graph, data flow, automation pipeline)
- Add typed input/output ports to nodes
- Theme port types with custom colours
- Render node previews, badges, or dividers
- Plan a node graph architecture

For the canvas that hosts nodes (pan/zoom/selection), see **substrate-canvas**.
For the scaffold shell around the editor, see **substrate-scaffold**.

---

## Components

### Node compound component

`registry/substrate/components/node.tsx`

10 exports forming a complete node card:

| Component | Slot | Purpose |
| --- | --- | --- |
| `NodeCard` | `node-card` | Outer card. Selected state adds accent ring. |
| `NodeHeader` | `node-header` | Optional coloured header strip. Pass `colour` for a category tint. |
| `NodeTitle` | `node-title` | Node name inside the header. |
| `NodeBadge` | `node-badge` | Small label (e.g. "GPU", "Deprecated"). |
| `NodeBody` | `node-body` | Content area below the header. |
| `NodePorts` | `node-ports` | Container for a column of ports (left or right side). |
| `NodePort` | `node-port` | A single port row: dot + label. Props: `type`, `label`, `direction`, `connected`. |
| `NodePortDot` | `node-port-dot` | The coloured circle. Filled when connected, hollow when not. |
| `NodePreview` | `node-preview` | Thumbnail/preview area inside the node body. |
| `NodeDivider` | `node-divider` | Thin horizontal line between body sections. |

### Port type system

7 built-in port types, each with a themed CSS variable:

| Type | CSS variable | Default colour |
| --- | --- | --- |
| `number` | `--node-port-number` | `#4a9eff` (blue) |
| `colour` | `--node-port-colour` | `#e84393` (pink) |
| `image` | `--node-port-image` | `#00b894` (green) |
| `geometry` | `--node-port-geometry` | `#fdcb6e` (amber) |
| `text` | `--node-port-text` | `#a29bfe` (violet) |
| `boolean` | `--node-port-boolean` | `#fd79a8` (rose) |
| `any` | `--node-port-any` | `#636e72` (grey) |

These follow the standard Substrate CSS variable fallback chain in `globals.css`:

```css
--color-node-port-number: var(--node-port-number, #4a9eff);
```

Consumers override `--node-port-number` to change the colour across their entire app.

### Node chrome variables

4 additional CSS variables for the node card itself:

| Variable | Default | Purpose |
| --- | --- | --- |
| `--node-bg` | `var(--popover)` | Node card background |
| `--node-border` | `var(--border)` | Node card border |
| `--node-header-bg` | `var(--muted)` | Header strip background |
| `--node-selected-ring` | `var(--accent)` | Selected ring colour |

---

## Usage

### Basic node

```tsx
<NodeCard selected={isSelected}>
  <NodeHeader colour="#4a9eff">
    <NodeTitle>Add</NodeTitle>
    <NodeBadge>Math</NodeBadge>
  </NodeHeader>
  <NodeBody>
    <div className="flex justify-between">
      <NodePorts>
        <NodePort type="number" label="A" direction="input" connected />
        <NodePort type="number" label="B" direction="input" />
      </NodePorts>
      <NodePorts>
        <NodePort type="number" label="Result" direction="output" connected />
      </NodePorts>
    </div>
  </NodeBody>
</NodeCard>
```

### Node with preview

```tsx
<NodeCard>
  <NodeHeader colour="#00b894">
    <NodeTitle>Blur</NodeTitle>
  </NodeHeader>
  <NodeBody>
    <NodePreview>
      <img src={previewUrl} alt="Preview" />
    </NodePreview>
    <NodeDivider />
    <div className="flex justify-between">
      <NodePorts>
        <NodePort type="image" label="Input" direction="input" connected />
        <NodePort type="number" label="Radius" direction="input" />
      </NodePorts>
      <NodePorts>
        <NodePort type="image" label="Output" direction="output" />
      </NodePorts>
    </div>
  </NodeBody>
</NodeCard>
```

---

## Architecture recommendations

### Node graph store

A node editor typically needs a Zustand store with:

```ts
interface NodeGraphState {
  nodes: Record<string, NodeData>
  connections: Connection[]
  selectedNodeIds: Set<string>

  // CRUD
  addNode: (type: string, position: Point) => void
  updateNode: (id: string, changes: Partial<NodeData>) => void
  removeNodes: (ids: string[]) => void

  // Connections
  connect: (from: PortRef, to: PortRef) => void
  disconnect: (connectionId: string) => void

  // History
  pushSnapshot: () => void
  undo: () => void
  redo: () => void
}

interface NodeData {
  id: string
  type: string
  position: Point
  inputs: PortDefinition[]
  outputs: PortDefinition[]
  properties: Record<string, unknown>
}

interface Connection {
  id: string
  from: PortRef
  to: PortRef
}

interface PortRef {
  nodeId: string
  portId: string
}
```

### Rendering connections

Connection wires between ports are typically rendered as SVG `<path>` elements (cubic beziers) in a layer above the nodes. The path control points depend on port direction:

- Output ports: bezier exits rightward
- Input ports: bezier enters from the left

Use `useViewport` (substrate-canvas) for the pan/zoom transform that applies to both nodes and wires.

### Port type validation

When the user drags a wire from an output port to an input port, validate type compatibility:

- Same type → allow
- `any` type → allow
- Different types → show visual feedback (red wire, shake animation) and reject

---

## Cross-references

| Need | Skill |
| --- | --- |
| Pan/zoom canvas hosting nodes | **substrate-canvas** |
| App shell, breadcrumbs for nested groups | **substrate-scaffold** |
| Property controls for selected node | **substrate-controls** |
| Selection, undo, keyboard shortcuts | **substrate-interaction** |
| Command palette for "Add Node" | **substrate-feedback** |
