const { Habit } = require('../../models/habit')
const { Record } = require('../../models/record')

const mongoose = require('mongoose')
let server
const request = require('supertest')
const createJWKSMock = require('mock-jwks').default
const mock = createJWKSMock('https://dev-5e2zuayl.us.auth0.com/')

describe('/records', () => {
  const _userId = 'testing|uiniu8998njk3245'
  const unownedUserId = 'testing|uiniu899889unjih5'
  let token
  let ownedHabitId
  let unownedHabitId
  let ownedRecordId
  let unownedRecordId
  beforeEach(async () => {
    token = mock.token({
      sub: _userId,
      aud: 'http://localhost:3001',
      iss: 'https://dev-5e2zuayl.us.auth0.com/',
    })
    mock.start()
    server = require('../../index')
    const ownedHabit = new Habit({
      _userId: _userId,
      name: 'New Habit',
      color: { r: 0, g: 0, b: 0 },
    })
    await ownedHabit.save()
    ownedHabitId = ownedHabit._id
    const unownedHabit = new Habit({
      _userId: unownedUserId,
      name: 'New Habit',
      color: { r: 0, g: 0, b: 0 },
    })
    await unownedHabit.save()
    unownedHabitId = unownedHabit._id

    let record = new Record({ _habitId: ownedHabitId, _userId: _userId })
    await record.save()
    ownedRecordId = record._id
    record = new Record({ _habitId: ownedHabitId, _userId: _userId })
    await record.save()
    record = new Record({
      _habitId: unownedHabitId,
      _userId: unownedUserId,
    })
    await record.save()
    unownedRecordId = record._id
  })
  afterEach(async () => {
    await Habit.deleteMany({ _userId: _userId })
    await Habit.deleteMany({ _userId: unownedUserId })
    await Record.deleteMany({ _userId: _userId })
    await Record.deleteMany({ _userId: unownedUserId })
    await mock.stop()
  })
  describe('GET /', () => {
    const exec = async () => {
      return await request(server)
        .get('/records')
        .set('Authorization', `Bearer ${token}`)
    }

    it('should return the two records that belong to the user', async () => {
      const res = await exec()
      expect(res.body.length).toBe(2)
    })
    it('should return 401 if the user is not signed in', async () => {
      token = null
      const res = await exec()
      expect(res.status).toBe(401)
    })
  })
  describe('GET /:id', () => {
    let _habitId
    const exec = async () => {
      return await request(server)
        .get(`/records/${_habitId}`)
        .set('Authorization', `Bearer ${token}`)
    }
    it('should return the two records for the given habitId', async () => {
      _habitId = ownedHabitId
      const res = await exec()
      expect(res.body.length).toBe(2)
    })
    it('should return no records if given another users habitId', async () => {
      _habitId = unownedHabitId
      const res = await exec()
      expect(res.body.length).toBe(0)
    })
    it('should return 401 if the user is not signed in', async () => {
      token = null
      const res = await exec()
      expect(res.status).toBe(401)
    })
  })
  describe('POST /', () => {
    let recordToAdd
    const exec = async () => {
      return await request(server)
        .post('/records')
        .set('Authorization', `Bearer ${token}`)
        .send(recordToAdd)
    }
    it('should save the record if the user owns the habit with the given Id', async () => {
      recordToAdd = { _habitId: ownedHabitId }
      const res = await exec()
      const records = await Record.find({ _habitId: ownedHabitId })

      expect(records.length).toBe(3)
    })
    it('should save a record with a custom completedAt time', async () => {
      let time = Date.now()
      recordToAdd = { _habitId: ownedHabitId, completedAt: time }
      const res = await exec()
      const records = await Record.find({ _habitId: ownedHabitId })
      expect(records.length).toBe(3)
    })
    it('should return 400 if the completedAt is not a valid timestamp', async () => {
      recordToAdd = { _habitId: ownedHabitId, completedAt: 'asdfasdfasd' }
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 400 if the habitId is not valid', async () => {
      recordToAdd = { _habitId: 'asdfasdfasdf' }
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 404 if the habitId does not exist', async () => {
      recordToAdd = { _habitId: mongoose.Types.ObjectId() }
      const res = await exec()
      expect(res.status).toBe(404)
    })
    it('should return 404 if the user does not own the habit', async () => {
      recordToAdd._habitId = unownedHabitId
      const res = await exec()
      expect(res.status).toBe(404)
    })
    it('should return 401 if the user is not signed in', async () => {
      token = null
      const res = await exec()
      expect(res.status).toBe(401)
    })
  })
  describe('DELETE /:id', () => {
    let _recordId
    const exec = async () => {
      return await request(server)
        .delete(`/records/${_recordId}`)
        .set('Authorization', `Bearer ${token}`)
    }
    it('should delete the record', async () => {
      _recordId = ownedRecordId
      let record = await Record.findById(_recordId)
      expect(record).toBeTruthy()
      const res = await exec()
      record = await Record.findById(_recordId)
      expect(record).toBeFalsy()
    })
    it('should return the deleted record', async () => {
      _recordId = ownedRecordId
      const res = await exec()
      expect(res.body._id).toEqual(_recordId.toString())
    })
    it('should return 404 if the user does not own the record', async () => {
      _recordId = unownedRecordId
      const res = await exec()
      expect(res.status).toBe(404)
    })
    it('should return 404 if the record does not exist', async () => {
      _recordId = mongoose.Types.ObjectId()
      const res = await exec()
      expect(res.status).toBe(404)
    })
    it('should return 400 if the recordId is not valid', async () => {
      _recordId = 'asdasdfasdg'
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 401 if the user is not signed in', async () => {
      token = null
      const res = await exec()
      expect(res.status).toBe(401)
    })
  })
})
