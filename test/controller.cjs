const { controller } = require('../dist/controlly.cjs');

// Mock del controlador que lanza un error para probar el catch
const testController = async (req, res, next) => {
  throw new Error('Test error');
};

const req = {
  protocol: 'https',
  get: (param) => {
    if (param === 'host') {
      return 'localhost';
    }
  },
  originalUrl: '/api/test',
  body: { test: true },
  transaction: { finished: false, rollback: async () => console.log('Rollback called') }
};

const res = {
  status: function (code) {
    console.log('Status:', code);
    return this;
  },
  json: function (data) {
    console.log('JSON Response:', data);
  }
};

const next = () => { console.log('Next called'); };

// Forzamos el entorno para la prueba
process.env.APP_ENVIRONMENT = 'prd';

// Ejecutamos el middleware envuelto
controller(testController)(req, res, next);
