export const hasStrokeStyle = (node: SceneNode): node is SceneNode & MinimalStrokesMixin =>
	Boolean(node['strokeStyleId'])