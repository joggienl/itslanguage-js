/**
 * This file contains the readily availbile functions which interact with the
 * ITSLanguage choice challenge API.
 */

import {authorisedRequest} from '../../communication';

// The URL for the choice challenge handler(s).
const url = '/challenges/choice';


/**
 * Create a new choice challenge.
 *
 * @param {Object} challenge - The challenge to create.
 *
 * @returns {Promise} - The challenge creation promise.
 */
export function createChoiceChallenge(challenge) {
  return authorisedRequest('POST', url, challenge);
}


/**
 * Get a single choice challenge by its ID.
 *
 * @param {string} id - The ID of the desired choice challenge.
 *
 * @returns {Promise} - The promise for the choice challenge.
 */
export function getChoiceChallengeByID(id) {
  return authorisedRequest('GET', `${url}/${id}`);
}


/**
 * Get a all choice challenges.
 *
 * By default all choice challenges are fetched though it is allowed to pass
 * filters as a `URLSearchParams` object.
 *
 * @param {URLSearchParams} [filters] - The filters to apply to the category
 *                                      list.
 *
 * @throws {Promise.<string>} - If the given optional filters are not an
 *                              instance of `URLSearchParams`.
 *
 * @returns {Promise} - The promise for the choice challenges.
 */
export function getAllChoiceChallenges(filters) {
  let urlWithFilters = url;

  if (filters) {
    if (!(filters instanceof URLSearchParams)) {
      return Promise.reject('The filters should be a `URLSearchParams` object.');
    }

    urlWithFilters += `?${filters.toString()}`;
  }

  return authorisedRequest('GET', urlWithFilters);
}