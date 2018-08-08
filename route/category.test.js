const _ = require('lodash')

const testHelper = require('test')

testHelper.api('should get user categories', async function (test, request) {
  const categoryName01 = 'Test category 1'
  const categoryName02 = 'Test category 2'

  const user = await testHelper.createUser()
  await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: categoryName01})

  await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: categoryName02})

  const {body} = await request.get('/category')
  .set(testHelper.auth(user.id))

  test.ok(_(body.data).map('name').difference([categoryName01, categoryName02]).size() === 0, 'Should get user categories')
})

testHelper.api('should get user categories, but result is empty array', async function (test, request) {
  const user = await testHelper.createUser()
  const {body} = await request.get('/category')
  .set(testHelper.auth(user.id))

  test.ok(_.size(body.data) === 0, 'empty array for user categories')
})

testHelper.api('should create a category for the user', async function (test, request) {
  const categoryName = 'Test category'

  const user = await testHelper.createUser()
  const {body} = await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: categoryName})

  test.same(body.data, {
    id: 1,
    name: categoryName,
    userId: testHelper.user.id,
  }, 'a new category should be created for the user')
})

testHelper.api('should throw duplicate name for category', async function (test, request) {
  const categoryName = 'Test category'

  const user = await testHelper.createUser()
  await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: categoryName})

  const {body} = await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: categoryName})

  test.ok(body.error === 'category.duplicate', 'name should be unique for user')
})

testHelper.api('should get the newly created category', async function (test, request) {
  const categoryName = 'Test category'
  const user = await testHelper.createUser()

  const categoryData = await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: categoryName})

  const {body} = await request.get(`/category/${categoryData.body.data.id}`)
  .set(testHelper.auth(user.id))

  test.same(body.data, {
    id: 1,
    name: categoryName,
    userId: testHelper.user.id,
  }, 'should get the new category')
})

testHelper.api('should throw a category not found error', async function (test, request) {
  const user = await testHelper.createUser()
  const {body} = await request.get('/category/9999')
  .set(testHelper.auth(user.id))

  test.ok(body.error === 'category.not_found', 'category not found error should be thrown')
})

testHelper.api('should update the category', async function (test, request) {
  const newCategoryName = 'Updated category name'
  const user = await testHelper.createUser()

  const categoryData = await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: 'test category'})

  const {body} = await request.put(`/category/${categoryData.body.data.id}`)
  .set(testHelper.auth(user.id))
  .send({name: newCategoryName})

  test.ok(body.data.name === newCategoryName, 'name should be updated')
})

testHelper.api('should throw error for update, because category name is taken', async function (test, request) {
  const newCategoryName = 'test category 01'
  const user = await testHelper.createUser()

  await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: 'test category 01'})

  const categoryData = await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: 'test category 02'})

  const {body} = await request.put(`/category/${categoryData.body.data.id}`)
  .set(testHelper.auth(user.id))
  .send({name: newCategoryName})

  test.ok(body.error === 'category.duplicate', 'duplicate category name')
})

testHelper.api('should delete the category', async function (test, request) {
  const user = await testHelper.createUser()
  const categoryData = await request.post('/category')
  .set(testHelper.auth(user.id))
  .send({name: 'test category'})

  const {body} = await request.delete(`/category/${categoryData.body.data.id}`)
  .set(testHelper.auth(user.id))

  test.ok(_.isEmpty(body.data), 'category deleted')
})

testHelper.api('should throw an error for delete category, because category does not exist', async function (test, request) {
  const user = await testHelper.createUser()
  const {body} = await request.delete('/category/9999')
  .set(testHelper.auth(user.id))

  test.ok(body.error === 'category.not_found', 'category does not exist')
})
