interface Transformer {
  prefix: string
  /**
   * The plugin passes in this function through a loop according to
   * the names of all components matched by the prefix.
   *
   * @example
   *
   * {
   *   prefix: 'self-',
   *   getComponentPath: (componentName) => {
   *     return `../../components/${componentName}/index`
   *   }
   * }
   *
   */
  getComponentPath: (componentName: string) => string
}

export interface Options {
  /**
   * @example
   * wechat miniprogram this value is 'usingComponents'
   */
  targetKey: string
  transformers: Transformer[]
}
