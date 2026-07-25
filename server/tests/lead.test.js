const request = require('supertest');
const app = require('../server');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./setup');

describe('Leads API (Create & Update)', () => {
  let authToken;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Register & login test user to obtain auth token
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Lead Manager',
        email: 'manager@example.com',
        password: 'password123',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@example.com',
        password: 'password123',
      });

    authToken = loginRes.body.token;
  });

  describe('POST /api/leads (Create Lead)', () => {
    it('should successfully create a new lead when authenticated', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Acme Corp Contact',
          email: 'contact@acme.com',
          phone: '555-0199',
          company: 'Acme Corporation',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('lead');
      expect(res.body.lead).toHaveProperty('name', 'Acme Corp Contact');
      expect(res.body.lead).toHaveProperty('company', 'Acme Corporation');
      expect(res.body.lead).toHaveProperty('status', 'NEW');
    });

    it('should reject lead creation if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Lead',
          email: 'incomplete@example.com',
          // Missing phone and company
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Missing required lead fields');
    });
  });

  describe('PUT /api/leads/:id (Update Lead)', () => {
    let leadId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Tech Partner',
          email: 'info@techpartner.com',
          phone: '555-0200',
          company: 'Tech Partner LLC',
        });

      leadId = createRes.body.lead._id;
    });

    it('should update lead status and details when authorized', async () => {
      const res = await request(app)
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'QUALIFIED',
          company: 'Tech Partner Global',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('lead');
      expect(res.body.lead).toHaveProperty('status', 'QUALIFIED');
      expect(res.body.lead).toHaveProperty('company', 'Tech Partner Global');
    });

    it('should append an activity log entry when lead status is updated', async () => {
      const res = await request(app)
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'WON',
        });

      expect(res.statusCode).toBe(200);
      const activityLog = res.body.lead.activityLog;
      expect(Array.isArray(activityLog)).toBe(true);
      const statusActivity = activityLog.find((a) => a.action === 'STATUS_CHANGED');
      expect(statusActivity).toBeDefined();
      expect(statusActivity).toHaveProperty('oldValue', 'NEW');
      expect(statusActivity).toHaveProperty('newValue', 'WON');
    });
  });
});
