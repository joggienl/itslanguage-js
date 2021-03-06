import PronunciationChallenge from './pronunciation-challenge';

/**
 * Controller class for the PronunciationChallenge model.
 * @private
 */
export default class PronunciationChallengeController {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    /**
     * Object to use for making a connection to the REST API and Websocket server.
     * @type {Connection}
     */
    this._connection = connection;
  }

  /**
   * Create a pronunciation challenge. The created challenge will be part of the current active {@link Organisation}
   * derived from the OAuth2 scope.
   *
   * @param {PronunciationChallenge} challenge - Object to create.
   * @param {Blob} audioBlob - Audio fragment to link to the challenge.
   * @returns {Promise.<PronunciationChallenge>} Promise containing the newly created PronunciationChallenge.
   * @throws {Promise.<Error>} challenge parameter of type "PronunciationChallenge" is required.
   * @throws {Promise.<Error>} audioBlob parameter of type "Blob" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createPronunciationChallenge(challenge, audioBlob) {
    if (!(challenge instanceof PronunciationChallenge)) {
      return Promise.reject(new Error('challenge parameter of type "PronunciationChallenge" is required'));
    }

    if (!(audioBlob instanceof Blob)) {
      return Promise.reject(new Error(
        'audioBlob parameter of type "Blob" is required'));
    }

    challenge.referenceAudio = audioBlob;
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation';
    const fd = JSON.stringify(challenge);
    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new PronunciationChallenge(data.id, data.transcription, data.referenceAudioUrl);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        result.status = data.status;
        return result;
      });
  }

  /**
   * Get a pronunciation challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a pronunciation challenge identifier.
   * @returns {Promise.<PronunciationChallenge>} Promise containing a PronunciationChallenge.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getPronunciationChallenge(challengeId) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation/' + challengeId;
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const challenge = new PronunciationChallenge(data.id, data.transcription, data.referenceAudioUrl);
        challenge.created = new Date(data.created);
        challenge.updated = new Date(data.updated);
        challenge.status = data.status;
        return challenge;
      });
  }

  /**
   * Get and return all pronunciation challenges in the current active {@link Organisation} derived from
   * the OAuth2 scope.
   *
   * @returns {Promise.<PronunciationChallenge[]>} Promise containing a list of PronunciationChallenges.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getPronunciationChallenges() {
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation';
    return this._connection._secureAjaxGet(url)
      .then(data => data.map(datum => {
        const challenge = new PronunciationChallenge(datum.id, datum.transcription, datum.referenceAudioUrl);
        challenge.created = new Date(datum.created);
        challenge.updated = new Date(datum.updated);
        challenge.status = datum.status;
        return challenge;
      }));
  }

  /**
   * Delete a pronunciation challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} challengeId - A pronunciation challenge identifier.
   * @returns {Promise.<PronunciationChallenge>} Promise containing the given challenge ID.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  deletePronunciationChallenge(challengeId) {
    if (!challengeId) {
      return Promise.reject(new Error('challengeId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/challenges/pronunciation/' +
      challengeId;
    return this._connection._secureAjaxDelete(url)
      .then(() => challengeId);
  }
}
