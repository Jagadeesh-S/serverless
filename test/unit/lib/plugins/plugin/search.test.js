'use strict';

const chai = require('chai');
const sinon = require('sinon');
const BbPromise = require('bluebird');
const PluginSearch = require('../../../../../lib/plugins/plugin/search');
const Serverless = require('../../../../../lib/serverless');
const CLI = require('../../../../../lib/classes/cli');
chai.use(require('chai-as-promised'));
const expect = require('chai').expect;

describe('PluginSearch', () => {
  let pluginSearch;
  let serverless;

  const plugins = [
    {
      name: 'serverless-plugin-1',
      description: 'Serverless Plugin 1',
      githubUrl: 'https://github.com/serverless/serverless-plugin-1',
    },
    {
      name: 'serverless-plugin-2',
      description: 'Serverless Plugin 2',
      githubUrl: 'https://github.com/serverless/serverless-plugin-2',
    },
    {
      name: 'serverless-existing-plugin',
      description: 'Serverless Existing plugin',
      githubUrl: 'https://github.com/serverless/serverless-existing-plugin',
    },
  ];

  beforeEach(() => {
    serverless = new Serverless({ commands: [], options: {} });
    serverless.cli = new CLI(serverless);
    const options = {};
    pluginSearch = new PluginSearch(serverless, options);
  });

  describe('#constructor()', () => {
    let searchStub;

    beforeEach(async () => {
      searchStub = sinon.stub(pluginSearch, 'search').returns(BbPromise.resolve());
    });

    afterEach(() => {
      pluginSearch.search.restore();
    });

    it('should have the sub-command "search"', () => {
      expect(pluginSearch.commands.plugin.commands.search).to.not.equal(undefined);
    });

    it('should have the lifecycle event "search" for the "search" sub-command', () => {
      expect(pluginSearch.commands.plugin.commands.search.lifecycleEvents).to.deep.equal([
        'search',
      ]);
    });

    it('should have a required option "query" for the "search" sub-command', () => {
      // eslint-disable-next-line no-unused-expressions
      expect(pluginSearch.commands.plugin.commands.search.options.query.required).to.be.true;
    });

    it('should have a "plugin:search:search" hook', () => {
      expect(pluginSearch.hooks['plugin:search:search']).to.not.equal(undefined);
    });

    it('should run promise chain in order for "plugin:search:search" hook', async () =>
      expect(pluginSearch.hooks['plugin:search:search']()).to.be.fulfilled.then(() => {
        expect(searchStub.calledOnce).to.equal(true);
      }));
  });

  describe('#search()', () => {
    let getPluginsStub;
    let displayStub;

    beforeEach(async () => {
      getPluginsStub = sinon.stub(pluginSearch, 'getPlugins').returns(BbPromise.resolve(plugins));
      displayStub = sinon.stub(pluginSearch, 'display').returns(BbPromise.resolve());
    });

    afterEach(() => {
      pluginSearch.getPlugins.restore();
      pluginSearch.display.restore();
    });

    it('should return a list of plugins based on the search query', async () => {
      pluginSearch.options.query = 'serverless-plugin-1';

      return expect(pluginSearch.search()).to.be.fulfilled.then(() => {
        expect(getPluginsStub.calledOnce).to.equal(true);
        expect(displayStub.calledOnce).to.equal(true);
      });
    });
  });
});
