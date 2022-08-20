export const hasStrokes = (node: SceneNode): node is SceneNode & MinimalStrokesMixin =>
	Boolean(node['strokes'])