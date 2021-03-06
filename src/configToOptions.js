import jsx from 'h2x-plugin-jsx'
import wrapIntoComponent from './transforms/wrapIntoComponent'
import wrapIntoNativeComponent from './transforms/wrapIntoNativeComponent'
import stripAttribute from './h2x/stripAttribute'
import emSize from './h2x/emSize'
import expandProps from './h2x/expandProps'
import svgRef from './h2x/svgRef'
import replaceAttrValue from './h2x/replaceAttrValue'
import removeComments from './h2x/removeComments'
import removeStyle from './h2x/removeStyle'
import toReactNative from './h2x/toReactNative'

const defaultConfig = {
  ref: false,
  svgo: true,
  prettier: true,
  native: false,
  icon: false,
  viewBox: true,
  replaceAttrValues: [],
  expandProps: true,
  title: true,
  keepUselessDefs: false,
  ids: false,
  precision: 3, // default to svgo
  semi: undefined, // default to prettier
  singleQuote: undefined, // default to prettier
  tabWidth: undefined, // default to prettier
  useTabs: undefined, // default to prettier
  trailingComma: undefined, // default to prettier
  bracketSpacing: undefined, // default to prettier
  jsxBracketSameLine: undefined, // default to prettier
  template: wrapIntoComponent,
  ext: 'js',
}

function configToOptions(config = {}) {
  if (!config.template && config.native)
    config.template = wrapIntoNativeComponent
  config = { ...defaultConfig, ...config }

  function getH2xPlugins() {
    const plugins = [jsx, stripAttribute('xmlns'), removeComments, removeStyle]
    if (config.icon) plugins.push(emSize)
    config.replaceAttrValues.forEach(([oldValue, newValue]) => {
      plugins.push(replaceAttrValue(oldValue, newValue))
    })
    if (config.ref) plugins.push(svgRef)
    if (config.expandProps) plugins.push(expandProps)
    if (config.native) plugins.push(toReactNative)

    return plugins
  }

  function getSvgoConfig() {
    const plugins = []
    const svgoConfig = { plugins }
    if (!config.title || config.icon) plugins.push({ removeTitle: {} })
    else if (config.title) plugins.push({ removeTitle: false })
    if (config.viewBox) plugins.push({ removeViewBox: false })
    if (config.keepUselessDefs) plugins.push({ removeUselessDefs: false })
    if (config.ids) plugins.push({ cleanupIDs: { remove: false } })
    if (config.precision === 'number')
      svgoConfig.floatPrecision = Number(svgoConfig.precision)
    return svgoConfig
  }

  function getPrettierConfig() {
    return {
      semi: config.semi,
      singleQuote: config.singleQuote,
      tabWidth: config.tabWidth,
      useTabs: config.useTabs,
      trailingComma: config.trailingComma,
      bracketSpacing: config.bracketSpacing,
      jsxBracketSameLine: config.jsxBracketSameLine,
    }
  }

  return {
    svgo: config.svgo ? getSvgoConfig() : null,
    h2x: {
      plugins: getH2xPlugins(),
    },
    prettier: config.prettier ? getPrettierConfig() : null,
    template: config.template(config),
    ext: config.ext,
  }
}

export default configToOptions
