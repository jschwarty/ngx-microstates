import { NgxMicrostatesPage } from './app.po';

describe('ngx-microstates App', () => {
  let page: NgxMicrostatesPage;

  beforeEach(() => {
    page = new NgxMicrostatesPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
