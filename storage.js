var MyStorage = (function () {

  const CONFIG_KEY = 'config'
  const RECORD_KEY = 'records'

  function getObject (storekey, backoff) {
    let obj = localStorage.getItem(storekey)
    if (!obj) return obj || backoff
    return JSON.parse(obj)
  }

  function setObject (storekey, obj) {
    localStorage.setItem(storekey, JSON.stringify(obj))
  }

  function isRecordEqual (source, target) {
    return source.method === target.method &&
      source.path === target.path &&
      JSON.stringify(source.reqBody) === JSON.stringify(target.reqBody)
  }

  function maxRecordsRestrict (config, records) {
    let max = parseInt(config.maxRecords) || -1 
    if (max < -1) return records
    return records.slice(0, max)
  }

  class MyStorage {
    static get config() {
      return getObject(CONFIG_KEY, {})
    }

    static set config(obj) {
      return setObject(CONFIG_KEY, obj)
    }

    static get records() {
      return getObject(RECORD_KEY, [])
    }

    static set records(obj) {
      return setObject(RECORD_KEY, obj)
    }

    static addRecord(record) {
      record.id = Date.now()
      let records = MyStorage.records
      if (!records.length) {
        records.push(record)
      } else {
        let top = records[0]
        if (isRecordEqual(top, record)) {
          records[0] = record
        } else {
          records.unshift(record)
        }
      }
      MyStorage.records = maxRecordsRestrict(MyStorage.config, records)
      return records
    }

    static removeRecord(id) {
      let records = MyStorage.records
      let left = records.filter(record => record.id !== id)
      MyStorage.records = left
      return left.length !== records.length
    }
  }

  return MyStorage
})()
