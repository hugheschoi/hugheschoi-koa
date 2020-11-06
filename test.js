// 合成事件
/**
 * 
 * @param {*} dom  给哪个元素帮事件，真实元素dom
 * @param {*} eventType 事件类型 onclick
 * @param {*} listener 事件处理函数 handleClick
 */
export function addEvent(dom, eventType, listener) {
  let store = dom.store || (dom.store = {})
  store[eventType] = listener
  if (!document[eventType]) {
    // document.addEventListener(eventType.slice(2), dispatchEvent, false)
    document[eventType] = dispatchEvent
  }
}
function dispatchEvent(event) {
  let { target, type } = event
  let eventType = `on${type}`
}