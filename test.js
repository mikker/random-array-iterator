const test = require('brittle')
const Iterator = require('./')

test('basic', function (t) {
  let diff = 0

  for (let n = 0; n < 5; n++) {
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const old = values.join(',')

    const cnts = {}
    for (const i of new Iterator(values)) {
      cnts[i] = (cnts[i] || 0) + 1
      t.is(cnts[i], 1)
    }

    if (values.join(',') !== old) diff++
    t.is(Object.keys(cnts).length, values.length)
  }

  t.ok(diff > 1)
})

test('requeue', function (t) {
  const values = [1, 2, 3, 4, 5]

  let requeues = 2

  const cnts = {}
  const ite = new Iterator(values)
  for (const i of ite) {
    if ((i === 1 || i === 3) && requeues-- > 0) {
      ite.requeue()
    }
    cnts[i] = (cnts[i] || 0) + 1
  }

  t.alike(cnts, {
    1: 2,
    2: 1,
    3: 2,
    4: 1,
    5: 1
  })
})

test('dequeue', function (t) {
  const values = [1, 2, 3, 4, 5]

  const ite = new Iterator(values)
  for (const i of ite) {
    if (i === 2 || i === 5) ite.dequeue()
  }

  t.alike(values.sort(), [1, 3, 4])
})

test('dequeue all', function (t) {
  const values = [1, 2, 3, 4, 5]

  const trace = []
  const ite = new Iterator(values)
  for (const i of ite) {
    ite.dequeue()
    trace.push(i)
  }

  t.alike(trace.sort(), [1, 2, 3, 4, 5])
  t.alike(values, [])
})

test('dequeue and requeue', function (t) {
  const values = [1, 2, 3, 4, 5]

  const ite = new Iterator(values)
  const trace = []
  let requeue = true

  for (const i of ite) {
    if (i === 2 || i === 5) ite.dequeue()
    if (requeue && i === 3) {
      requeue = false
      ite.requeue()
    }
    trace.push(i)
  }

  t.alike(values.sort(), [1, 3, 4])
  t.alike(trace.sort(), [1, 2, 3, 3, 4, 5])
})
