const request = require('supertest');
const app = require('../server');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./setup');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

describe('Authorization & Protected Routes', () => {
  let memberToken;
  let adminToken;
  let leadId;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create a regular MEMBER user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const memberUser = new User({
      name: 'Regular Member',
      email: 'member@example.com',
      password: hashedPassword,
      role: 'MEMBER',
    });
    await memberUser.save();

    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@example.com', password: 'password123' });
    memberToken = memberLogin.body.token;

    // Create an ADMIN user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    });
    await adminUser.save();

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    // Create a lead with member
    const createLeadRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        name: 'Auth Test Lead',
        email: 'auth@test.com',
        phone: '555-9999',
        company: 'Auth Test Co',
      });
    leadId = createLeadRes.body.lead._id;
  });

  it('should return 401 when accessing protected route without token', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 when accessing protected route with invalid token', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', 'Bearer invalid_token_xyz');
    expect(res.statusCode).toBe(401);
  });

  it('should allow regular member to fetch their assigned leads', async () => {
    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('leads');
    expect(Array.isArray(res.body.leads)).toBe(true);
  });

  it('should return 403 when non-admin tries to reassign a lead', async () => {
    const res = await request(app)
      .patch(`/api/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ assignedTo: leadId });

    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to reassign a lead', async () => {
    const res = await request(app)
      .patch(`/api/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: leadId });

    expect(res.statusCode).toBe(200);
  });
});
