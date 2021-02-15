export const hasChildren = (node: BaseNode): node is BaseNode & ChildrenMixin =>
	Boolean(node['children'])