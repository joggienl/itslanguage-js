import 'jasmine-ajax';
import Connection from '../src/administrative-sdk/connection/connection-controller';
import SpeechChallenge from '../src/administrative-sdk/speech-challenge/speech-challenge';
import SpeechRecording from '../src/administrative-sdk/speech-recording/speech-recording';
import SpeechRecordingController from '../src/administrative-sdk/speech-recording/speech-recording-controller';
import Student from '../src/administrative-sdk/student/student';
import autobahn from 'autobahn';

describe('SpeechRecording object test', () => {
  it('should require all required fields in constructor', () => {
    expect(() => {
      new SpeechRecording();
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge ID" is required');
    expect(() => {
      new SpeechRecording(1);
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge ID" is required');

    const challenge = new SpeechChallenge('fb', '1');
    expect(() => {
      new SpeechRecording(challenge.id);
    }).toThrowError(
      'student parameter of type "Student" is required');
    expect(() => {
      new SpeechRecording(challenge.id, 1);
    }).toThrowError(
      'student parameter of type "Student" is required');

    const student = new Student('org');
    expect(() => {
      new SpeechRecording(challenge.id, student, 1);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(() => {
      new SpeechRecording(challenge.id, student, '1', 'foo');
    }).toThrowError('audio parameter of type "Blob|null" is required');
  });
  it('should instantiate a SpeechRecording', () => {
    const blob = new Blob(['1234567890']);
    const challenge = new SpeechChallenge('fb', '1');
    const student = new Student('org');

    // Without audio
    let s = new SpeechRecording(challenge.id, student, null);
    expect(s).toBeDefined();
    expect(s.id).toBeNull();
    expect(s.audio).toBeUndefined();
    expect(s.challenge).toBe(challenge.id);
    expect(s.student).toBe(student);

    // Without id
    s = new SpeechRecording(challenge.id, student, null, blob);
    expect(s).toBeDefined();
    expect(s.id).toBe(null);
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge.id);
    expect(s.student).toBe(student);

    // With id
    s = new SpeechRecording(challenge.id, student, 'test', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge.id);
    expect(s.student).toBe(student);
  });
});

describe('SpeechRecording API interaction test', () => {
  const api = new Connection({
    oAuth2Token: 'token'
  });
  const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
  const controller = new SpeechRecordingController(api);

  beforeEach(() => {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should reject to get a recording if organisationId is not present', done => {
    controller.getSpeechRecording()
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should reject to get a recording if challenge id is not present', done => {
    const challenge = new SpeechChallenge('fb', '');
    controller.getSpeechRecording(challenge.organisationId, null)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challengeId field is required');
      })
      .then(done);
  });

  it('should reject to get a recording if recording id is not present', done => {
    const challenge = new SpeechChallenge('fb', '1');
    controller.getSpeechRecording(challenge.organisationId, challenge.id)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('recordingId field is required');
      })
      .then(done);
  });

  it('should get an existing speech recording', done => {
    const url = 'https://api.itslanguage.nl/challenges/speech' +
      '/4/recordings/5';
    const content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
      studentId: '6'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    const challenge = new SpeechChallenge('fb', '4');
    controller.getSpeechRecording(challenge.organisationId, challenge.id, '5')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const student = new Student('fb', '6');
        const recording = new SpeechRecording(challenge.id, student, '5');
        const stringDate = '2014-12-31T23:59:59Z';
        recording.created = new Date(stringDate);
        recording.updated = new Date(stringDate);
        recording.audio = null;
        recording.audioUrl = audioUrl + '?access_token=token';
        expect(result).toEqual(recording);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should reject to get a list of recordings if organisationId is not present', done => {
    controller.listSpeechRecordings()
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should reject to get a list of recordings if challenge id is not present', done => {
    const challenge = new SpeechChallenge('fb', '');
    controller.listSpeechRecordings(challenge.organisationId)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challengeId field is required');
      })
      .then(done);
  });

  it('should get a list of existing speech recordings', done => {
    const url = 'https://api.itslanguage.nl/challenges/speech' +
      '/4/recordings';
    const content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
      studentId: '6'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const challenge = new SpeechChallenge('fb', '4');
    controller.listSpeechRecordings(challenge.organisationId, challenge.id)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const student = new Student('fb', '6');
        const recording = new SpeechRecording(challenge.id, student, '5');
        const stringDate = '2014-12-31T23:59:59Z';
        recording.created = new Date(stringDate);
        recording.updated = new Date(stringDate);
        recording.audio = null;
        recording.audioUrl = audioUrl + '?access_token=token';
        expect(result[0]).toEqual(recording);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});

describe('Speech Recording Websocket API interaction test', () => {
  let api;
  let fakeResponse;
  let RecorderMock;
  let SessionMock;
  let challenge;
  let recorder;
  let session;
  let stringDate;
  let controller;

  beforeEach(() => {
    jasmine.Ajax.install();
    api = new Connection({
      wsToken: 'foo',
      wsUrl: 'ws://foo.bar',
      oAuth2Token: 'token'
    });
    fakeResponse = {
      created: new Date(stringDate),
      updated: new Date(stringDate),
      audioFormat: 'audio/wave',
      audioParameters: {
        channels: 1,
        sampleWidth: 16,
        sampleRate: 48000
      },
      audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
    };
    RecorderMock = function() {
      this.getAudioSpecs = function() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      };

      this.isRecording = function() {
        return false;
      };

      this.recorded = null;

      this.addEventListener = function(name, func) {
        if (name === 'recorded') {
          this.recorded = func;
        } else if (name === 'dataavailable') {
          func('EventFired');
          this.recorded('recordDone');
        } else {
          func();
        }
      };
      this.removeEventListener = function() {
      };

      this.hasUserMediaApproval = function() {
        return true;
      };
    };
    SessionMock = function() {
      this.call = function() {
        const d = autobahn.when.defer();
        d.resolve(fakeResponse);
        return d.promise;
      };
    };
    challenge = new SpeechChallenge('fb', '4');
    recorder = new RecorderMock();
    session = new SessionMock();
    stringDate = '2014-12-31T23:59:59Z';
    controller = new SpeechRecordingController(api);
    api._session = new SessionMock();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when challenge is not present', done => {
    controller.startStreamingSpeechRecording(null, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('"challenge" parameter is required or invalid');
      })
      .then(done);
  });

  it('should fail streaming when challenge is undefined', done => {
    controller.startStreamingSpeechRecording(undefined, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('"challenge" parameter is required or invalid');
      })
      .then(done);
  });

  it('should fail streaming when challenge.id is not present', done => {
    challenge = new SpeechChallenge('1', '', '', null);
    controller.startStreamingSpeechRecording(challenge, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.id field is required');
      })
      .then(done);
  });

  it('should fail streaming when challenge.organisationId is not present', done => {
    challenge = new SpeechChallenge('', '2', '', null);
    controller.startStreamingSpeechRecording(challenge, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.organisationId field is required');
      })
      .then(done);
  });

  it('should fail streaming when recording is already recording', done => {
    recorder.isRecording = () => true;
    api._session = {};
    challenge = new SpeechChallenge('1', '4', '', null);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Recorder should not yet be recording.');
      })
      .then(done);
  });

  it('should fail streaming when there is a session in progress', done => {
    recorder.isRecording = () => false;
    api._recordingId = '5';
    api._session = {};
    controller = new SpeechRecordingController(api);
    challenge = new SpeechChallenge('1', '4', '', null);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Session with recordingId 5 still in progress.');
      })
      .then(done);
  });

  it('should handle errors while initializing challenge', done => {
    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },

      isRecording() {
        return false;
      },

      addEventListener(name, func) {
        if (name === 'dataavailable') {
          func(1);
        } else if (name === 'ready') {
          func();
        }
      },
      removeEventListener() {
      },

      hasUserMediaApproval() {
        return true;
      }
    };

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.recording.init_recording') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.recording.init_challenge') {
        d.reject({error: 'error123'});
      } else {
        d.notify();
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors while initializing recording', done => {
    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },

      isRecording() {
        return false;
      },

      addEventListener(name, func) {
        if (name === 'dataavailable') {
          func(1);
        } else if (name === 'ready') {
          func();
        }
      },
      removeEventListener() {
      },

      hasUserMediaApproval() {
        return true;
      }
    };

    api._session.call = () => {
      const d = autobahn.when.defer();
      d.reject({error: 'error123'});
      return d.promise;
    };

    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors while initializing audio', done => {
    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },

      isRecording() {
        return false;
      },

      addEventListener(name, func) {
        if (name === 'dataavailable') {
          func(1);
        } else if (name === 'ready') {
          func();
        }
      },
      removeEventListener() {
      },

      hasUserMediaApproval() {
        return true;
      }
    };

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.recording.init_recording') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.recording.init_audio') {
        d.reject({error: 'error123'});
      } else {
        d.notify();
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors when closing streaming', done => {
    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },

      isRecording() {
        return false;
      },

      addEventListener(name, func) {
        if (name === 'dataavailable') {
          func(1);
        } else if (name === 'ready') {
          func();
        } else {
          setTimeout(func, 500);
        }
      },
      removeEventListener() {
      },

      hasUserMediaApproval() {
        return true;
      }
    };

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.recording.init_recording') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.recording.close') {
        d.reject({error: 'error123'});
      } else {
        d.notify();
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors when writing a chunk', done => {
    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },

      isRecording() {
        return false;
      },

      addEventListener(name, func) {
        if (name === 'dataavailable') {
          func(1);
        } else if (name === 'ready') {
          func();
        }
      },
      removeEventListener() {
      },

      hasUserMediaApproval() {
        return true;
      }
    };

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.recording.init_recording') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.recording.write') {
        d.reject({error: 'error123'});
      } else {
        d.notify();
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should wait to stream when there is no user approval yet', done => {
    recorder.hasUserMediaApproval = () => false;
    spyOn(recorder, 'addEventListener').and.callThrough();
    controller = new SpeechRecordingController(api);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        expect(recorder.addEventListener).toHaveBeenCalledWith('ready', jasmine.any(Function));
      })
      .catch(error => {
        fail('no error should be thrown ' + error);
      })
      .then(done);
  });

  it('should fail streaming when websocket connection is closed', done => {
    api = new Connection({});
    controller = new SpeechRecordingController(api);
    // Save WebSocket
    const old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');
    const expectedMessage = 'WebSocket connection was not open.';
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be thrown!');
      })
      .catch(error => {
        expect(error.message).toEqual(expectedMessage);
        // Restore WebSocket
        window.WebSocket = old;
      })
      .then(done);
  });

  it('should start streaming a new speech recording', done => {
    let progressCalled = false;
    api._session = session;
    spyOn(api._session, 'call').and.callThrough();
    controller.startStreamingSpeechRecording(
      challenge, recorder)
      .progress(() => {
        progressCalled = true;
      })
      .then(result => {
        expect(result.challenge).toEqual(challenge.id);
        expect(result.student.organisationId).toBe(challenge.organisationId);
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.recording.init_recording', []);
        expect(progressCalled).toBeTruthy();
        expect(result.recordingId).toEqual(fakeResponse);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
