export const hasFills = (node: SceneNode): node is SceneNode & MinimalFillsMixin =>
	Boolean(node['fillStyleId'])