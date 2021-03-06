const tap = require('tap');
const sinon = require('sinon');

const can = require('../../../middleware').can;
const getEndpoint = require('./get');

tap.test('submitted apds GET endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();
  const app = { get: sandbox.stub() };
  const toJSON = sandbox.stub();
  const ApdModel = {
    query: sandbox.stub(),
    fetchAll: sandbox.stub()
  };
  const res = {
    status: sandbox.stub(),
    send: sandbox.stub(),
    end: sandbox.stub()
  };

  endpointTest.beforeEach(done => {
    sandbox.resetBehavior();
    sandbox.resetHistory();

    ApdModel.query.returns(ApdModel);

    res.status.returns(res);
    res.send.returns(res);
    res.end.returns(res);

    done();
  });

  endpointTest.test('setup', async setupTest => {
    getEndpoint(app);

    setupTest.ok(
      app.get.calledWith(
        '/apds/submitted',
        can('submit-federal-response'),
        sinon.match.func
      ),
      'user-specific apds GET endpoint is registered'
    );
  });

  endpointTest.test('get submitted apds handler', async handlerTest => {
    let handler;
    handlerTest.beforeEach(done => {
      getEndpoint(app, ApdModel);
      handler = app.get.args.find(args => args[0] === '/apds/submitted')[2];
      done();
    });

    handlerTest.test(
      'sends a server error code if there is a database error',
      async invalidTest => {
        ApdModel.fetchAll.rejects();

        await handler({}, res);

        invalidTest.ok(res.status.calledWith(500), 'HTTP status set to 500');
        invalidTest.ok(res.send.notCalled, 'no body is sent');
        invalidTest.ok(res.end.called, 'response is terminated');
      }
    );

    handlerTest.test('sends apds', async validTest => {
      ApdModel.fetchAll.resolves({ toJSON });
      ApdModel.withRelated = 'this is related stuff';
      toJSON.returns(['a', 'b', 'c']);

      await handler({ params: {}, user: { state: 'va' } }, res);

      validTest.ok(res.status.notCalled, 'HTTP status not explicitly set');
      validTest.ok(ApdModel.query.calledWith('whereNot', 'status', 'draft'));
      validTest.ok(
        ApdModel.fetchAll.calledWith({ withRelated: 'this is related stuff' }),
        'fetches related activities, goals, and objectives'
      );
      validTest.ok(
        res.send.calledWith(['a', 'b', 'c']),
        'program info is sent back'
      );
    });
  });
});
