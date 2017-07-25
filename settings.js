const VALID_CONFIG_KEYS = ['patterns', 'reqTimeout', 'maxRecords', 'defaultHeader']
const ID_PREFIX = 'my'

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function compactJSON(str) {
  try {
    return JSON.stringify(JSON.parse(str))
  } catch (e) {
    return str
  }
}

function collectConfig() {
  let result = {}
  for (let key of VALID_CONFIG_KEYS) {
    result[key] = compactJSON($(`#${ID_PREFIX}${capitalize(key)}`).val())
    if (key === 'patterns') {
      result[key] = patternsDecode(result[key])
    }
  }
  return result
}

function patternsDecode(patterns) {
  let result = {}
  patterns.trim().split('\n').forEach(v => {
    let key, value
    if ((i = v.indexOf(':')) > -1) {
      key = v.slice(0, i).toLowerCase()
      value = v.slice(i+1).trim()
      result[key] = value
    }
  })
  return result
}

function patternsEncode(patterns) {
  let result = ''
  for (let key in patterns) {
    result += `${key}: ${patterns[key]}\n`
  }
  return result
}

$(function() {
  populateForm()
  $('#btnSave').on('click', onSave)
  autosize($('textarea'))
})

function populateForm() {
  let config = MyStorage.config
  for (let key in config) {
    if (VALID_CONFIG_KEYS.indexOf(key) >  -1 && config[key]) {
      if (key === 'patterns') {
        $(`#${ID_PREFIX}${capitalize(key)}`).val(patternsEncode(config[key]))
      } else {
        $(`#${ID_PREFIX}${capitalize(key)}`).val(config[key])
      }
    }
  }
}

function onSave() {
  MyStorage.config = collectConfig()
}
