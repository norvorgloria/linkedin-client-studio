import test from 'node:test';
import assert from 'node:assert/strict';
import {brief,calendar,postReview,metrics} from '../src/logic.js';
test('brief identifies missing proof',()=>assert.ok(brief({clientName:'Test'}).openQuestions.length));
test('calendar produces ideas',()=>assert.equal(calendar({audience:'Founders',pillars:['Sales'],startDate:'2026-11-09',weeks:2,postsPerWeek:3}).items.length,6));
test('post review is human-only',()=>assert.match(postReview({post:'We grew 300% last year.'}).status,/human/));
test('metrics calculate engagement rate',()=>assert.equal(metrics({period:'week',impressions:1000,engagements:100,profileViews:2,followersGained:2,leads:1}).engagementRatePercent,10));
