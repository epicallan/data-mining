import { expect as expect } from 'chai';
import dataMining from '../src/module.js';

describe('dataMining', () => {
  it('should be runing without any problems', () => {
    expect(dataMining).to.not.throw();
  });
});
