interface MinimalEffectMixin {
	effects: ReadonlyArray<Effect> | PluginAPI['mixed']
	effectStyleId: string | PluginAPI['mixed']
}

export const hasEffects = (node: SceneNode): node is SceneNode & MinimalEffectMixin =>
	Boolean(node['effectStyleId'])