const { Habit } = require('../../models/habit')
const mongoose = require('mongoose')
let server
const request = require('supertest')
const createJWKSMock = require('mock-jwks').default
const mock = createJWKSMock('https://dev-5e2zuayl.us.auth0.com/')

describe('/habits', () => {
  const _userId = 'testing|uiniu8998njkiknuj'
  const unownedUserId = 'testing2|uiniu8998njkiknuj'
  let token
  let firstHabitId
  let unownedHabitId
  beforeEach(async () => {
    token = mock.token({
      sub: _userId,
      aud: 'http://localhost:3001',
      iss: 'https://dev-5e2zuayl.us.auth0.com/',
    })
    mock.start()
    server = require('../../index')
    let habit = new Habit({
      _userId: _userId,
      name: 'habit 1',
      color: { r: 255, g: 255, b: 255 },
    })
    await habit.save()
    firstHabitId = habit._id
    habit = new Habit({
      _userId: _userId,
      name: 'habit 2',
      color: { r: 0, g: 0, b: 0 },
    })
    await habit.save()
    habit = new Habit({
      _userId: unownedUserId,
      name: 'habit 4',
      color: { r: 0, g: 0, b: 0 },
    })
    await habit.save()
    unownedHabitId = habit._id
  })
  afterEach(async () => {
    await Habit.deleteMany({ _userId: _userId })
    await Habit.deleteMany({ _userId: unownedUserId })

    await mock.stop()
  })
  describe('GET /', () => {
    const exec = async () => {
      return await request(server)
        .get('/habits')
        .set('Authorization', `Bearer ${token}`)
    }
    it('should return the 2 habits that belong to the user', async () => {
      const res = await exec()
      expect(res.body.length).toBe(2)
      expect(res.body.some((g) => g.name === 'habit 1')).toBeTruthy()
      expect(res.body.some((g) => g.name === 'habit 3')).toBeFalsy()
    })
    it('should return 401 user is not logged in', async () => {
      token = null
      const res = await exec()
      expect(res.status).toBe(401)
    })
  })
  describe('GET /:id', () => {
    let _habitId
    const exec = async () => {
      return await request(server)
        .get(`/habits/${_habitId}`)
        .set('Authorization', `Bearer ${token}`)
    }
    it('should return the correct habit', async () => {
      _habitId = firstHabitId
      const res = await exec()
      expect(res.body.name).toBe('habit 1')
    })
    it('should return 400 if an invalid ObjectID is passed', async () => {
      _habitId = 'asdfasdfasdfasdf'
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 404 if an ObjectID does not exist', async () => {
      _habitId = mongoose.Types.ObjectId()
      const res = await exec()
      expect(res.status).toBe(404)
    })
    it('should return 401 if client is not logged in', async () => {
      token = null
      const res = await exec()
      expect(res.status).toBe(401)
    })
    it('should return 404 if the habit is owned by another user ', async () => {
      _habitId = unownedHabitId
      const res = await exec()
      expect(res.status).toBe(404)
    })
  })
  describe('POST /', () => {
    let newHabit = { name: 'habit 3', color: { r: '0', g: '0', b: '0' } }
    const exec = async () => {
      return await request(server)
        .post('/habits')
        .set('Authorization', `Bearer ${token}`)
        .send(newHabit)
    }
    it('should save the habit if it is valid', async () => {
      const res = await exec()
      const habit = await Habit.findOne({ name: 'habit 3' })
      expect(habit).not.toBeNull()
    })
    it('should return the added habit', async () => {
      const res = await exec()
      expect(res.status).toBe(200)
      expect(res.body.name).toBe('habit 3')
    })
    it('should return 400 if the name is less than 2 characters', async () => {
      newHabit.name = 'a'
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 400 if there is no name', async () => {
      newHabit.name = null
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 400 if the name is more than 35 characters', async () => {
      newHabit.name = new Array(37).join('a')
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 400 if there is no color', async () => {
      newHabit.color = null
      const res = await exec()
      expect(res.status).toBe(400)
    })
  })
  describe('PUT /:id', () => {
    let updatedHabit = {
      name: 'updated name',
      color: { r: 255, g: 255, b: 255 },
    }
    let _habitId
    const exec = async () => {
      return await request(server)
        .put(`/habits/${_habitId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedHabit)
    }
    it('should update the habit', async () => {
      _habitId = firstHabitId
      const res = await exec()
      const updated = await Habit.findById(firstHabitId)
      expect(updated).toMatchObject(updatedHabit)
    })
    it('should return the updated habit', async () => {
      _habitId = firstHabitId
      const res = await exec()
      expect(res.body).toMatchObject(updatedHabit)
    })
    it('should return 404 if the habitId does not exist', async () => {
      _habitId = mongoose.Types.ObjectId()
      const res = await exec()
      expect(res.status).toBe(404)
    })
    it('should return 404 if the habit is owned by another user', async () => {
      _habitId = unownedHabitId
      const res = await exec()
      expect(res.status).toBe(404)
    })
    it('should return 401 if the user is not logged in', async () => {
      token = null
      const res = await exec()
      expect(res.status).toBe(401)
    })
    it('should return 400 if the name is less than 2 characters', async () => {
      _habitId = firstHabitId
      updatedHabit.name = 'a'
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 400 if the name is longer than 35 characters', async () => {
      _habitId = firstHabitId
      updatedHabit.name = new Array(37).join('a')
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 400 if the name is missing', async () => {
      _habitId = firstHabitId
      updatedHabit.name = null
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 400 if the color is missing', async () => {
      _habitId = firstHabitId
      updatedHabit.color = null
      const res = await exec()
      expect(res.status).toBe(400)
    })
  })
  describe('DELETE /:id', () => {
    let _habitId
    const exec = async () => {
      return await request(server)
        .delete(`/habits/${_habitId}`)
        .set('Authorization', `Bearer ${token}`)
    }
    it('should delete the habit', async () => {
      _habitId = firstHabitId
      const res = await exec()
      const habit = await Habit.findById(_habitId)
      expect(habit).toBeFalsy()
    })
    it('should return the deleted habit', async () => {
      _habitId = firstHabitId
      const res = await exec()
      expect(res.body._id).toEqual(_habitId.toString())
    })
    it('should return 404 if the user is not the owner of the habit', async () => {
      _habitId = unownedHabitId
      const res = await exec()
      expect(res.status).toBe(404)
    })
    it('should return 400 if the habitId is not valid', async () => {
      _habitId = 'jkdasjknsdnjkdanjks'
      const res = await exec()
      expect(res.status).toBe(400)
    })
    it('should return 404 if the habit does not exist', async () => {
      _habitId = mongoose.Types.ObjectId()
      const res = await exec()
      expect(res.status).toBe(404)
    })
  })
})
