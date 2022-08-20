export const hasFillStyles = (node: SceneNode): node is SceneNode & MinimalFillsMixin =>
	Boolean(node['fillStyleId'])