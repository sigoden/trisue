const IDS_KEY = "ids";
const ITEM_KEY = id => "data:" + id;

export default class Storage {
  constructor(mapFn = v => v) {
    this.mapFn = mapFn;
  }
  _support() {
    return typeof (localStorage) !== "undefined";
  }
  _ids() {
    if (!this._support()) return [];
    const ids_ = localStorage.getItem(IDS_KEY);
    if (!ids_) return [];
    return JSON.parse(ids_);
  }
  _idDel(ids, id) {
    const idx = ids.indexOf(id);
    if (idx === -1) return;
    ids.splice(idx, 1);
  }
  list() {
    const ids = this._ids();
    if (ids.length === 0) return [];
    const result = [];
    for (const id of ids) {
      const data = localStorage.getItem(ITEM_KEY(id));
      if (data) {
        result.push(this.mapFn(JSON.parse(data)));
      }
    }
    return result.reverse();
  }
  add(id, data) {
    if (!this._support()) return;
    const ids = this._ids();
    this._idDel(ids, id);
    localStorage.setItem(ITEM_KEY(id), JSON.stringify({ ...data, id, at: new Date() }))
    ids.push(id);
    localStorage.setItem(IDS_KEY, JSON.stringify(ids));
  }
  clear() {
    if (!this._support()) return;
    const ids = this._ids();
    for (const id of ids) {
      localStorage.removeItem(ITEM_KEY(id));
    }
    localStorage.removeItem(IDS_KEY);
  }
  get(id) {
    if (!this._support()) return;
    const data = localStorage.getItem(ITEM_KEY(id));
    if (!data) return null;
    return this.mapFn(JSON.parse(data));
  }
  remove(id) {
    if (!this._support()) return;
    const ids = this._ids();
    this._idDel(ids, id);
    localStorage.setItem(IDS_KEY, JSON.stringify(ids));
    localStorage.removeItem(ITEM_KEY(id));
  }
}