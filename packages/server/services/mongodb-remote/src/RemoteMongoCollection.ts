/**
 * Copyright 2018-present MongoDB, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Codec, Stream } from "mongodb-stitch-core-sdk";
import {
  ChangeEvent,
  CompactChangeEvent,
  RemoteCountOptions,
  RemoteDeleteResult,
  RemoteFindOneAndModifyOptions,
  RemoteFindOptions,
  RemoteInsertManyResult,
  RemoteInsertOneResult,
  RemoteUpdateOptions,
  RemoteUpdateResult,
} from "mongodb-stitch-core-services-mongodb-remote";
import RemoteMongoReadOperation from "./RemoteMongoReadOperation";

/**
 * The RemoteMongoCollection is the interface to a MongoDB database's
 * collection via Stitch, allowing read and write.
 *
 * It is retrieved from a [[RemoteMongoDatabase]].
 *
 * The read operations are [[find]], [[count]] and [[aggregate]].
 *
 * The write operations are [[insertOne]], [[insertMany]], 
 * [[updateOne]], [[updateMany]], [[deleteOne]], and [[deleteMany]].
 *
 * If you are already familiar with MongoDB drivers, it is important
 * to understand that the RemoteMongoCollection only provides access
 * to the operations available in Stitch. For a list of unsupported
 * aggregation stages, see 
 * [Unsupported Aggregation Stages](https://docs.mongodb.com/stitch/mongodb/actions/collection.aggregate/#unsupported-aggregation-stages).
 *
 * @note Log in first
 *
 * A user will need to be logged in (at least anonymously) before you can read from
 * or write to the collection. See [[StitchAuth]].
 * 
 * @see
 * - [[RemoteMongoClient]]
 * - [[RemoteMongoDatabase]]
 * - [CRUD Snippets](https://docs.mongodb.com/stitch/mongodb/crud-snippets/)
 */
export default interface RemoteMongoCollection<DocumentT> {
  /**
   * Gets the namespace of this collection.
   *
   * @return the namespace
   */
  readonly namespace: string;

  /**
   * Create a new RemoteMongoCollection instance with a different default class to cast any
   * documents returned from the database into.
   *
   * @param codec the default class to cast any documents returned from the database into.
   * @param <NewDocumentT> the type that the new collection will encode documents from and decode
   *                      documents to.
   * @return a new CoreRemoteMongoCollection instance with the different default class
   */
  withCollectionType<U>(codec: Codec<U>): RemoteMongoCollection<U>;

  /**
   * Counts the number of documents in the collection.
   * @param query the query filter
   * @param options the options describing the count
   *
   * @return a Promise containing the number of documents in the collection
   */
  count(query?: object, options?: RemoteCountOptions): Promise<number>;

  /**
   * Finds all documents in the collection that match the given query.
   * 
   * An empty query (`{}`) will match all documents.
   *
   * @param query the query filter
   * @return a read operation which can be used to execute the query
   */
  find(
    query?: object,
    options?: RemoteFindOptions
  ): RemoteMongoReadOperation<DocumentT>;

  /**
   * Finds one document in the collection that matches the given query.
   * 
   * An empty query (`{}`) will match all documents.
   *
   * @param query the query filter
   * @return the resulting document or null if the query resulted in zero matches
   */
  findOne(
    query?: object,
    options?: RemoteFindOptions
  ): Promise<DocumentT | null>;

  /**
   * Finds one document in the collection that matches the given query and performs the 
   * given update on that document. (An empty query {} will match all documents)
   *
   * @param query A `Document` that should match the query.
   * @param update A `Document` describing the update. 
   * @param options Optional: `RemoteFindOneAndModifyOptions` to use when executing the command.
   * @return A resulting `DocumentT` or null if the query returned zero matches.
   */
  findOneAndUpdate(
    query: object,
    update: object, 
    options?: RemoteFindOneAndModifyOptions
  ): Promise<DocumentT | null>;

  /**
   * Finds one document in the collection that matches the given query and replaces that document 
   * with the given replacement. (An empty query {} will match all documents)
   *
   * @param query A `Document` that should match the query.
   * @param replacement A `Document` that will replace the matched document 
   * @param options Optional: `RemoteFindOneAndModifyOptions` to use when executing the command.
   * @return A resulting `DocumentT` or null if the query returned zero matches.
   */
  findOneAndReplace(
    query: object,
    replacement: object, 
    options?: RemoteFindOneAndModifyOptions
  ): Promise<DocumentT | null>;

  /**
   * Finds one document in the collection that matches the given query and 
   * deletes that document. (An empty query {} will match all documents)
   *
   * @param query A `Document` that should match the query.
   * @param options Optional: `RemoteFindOneAndModifyOptions` to use when executing the command.
   * @return The `DocumentT` being deleted or null if the query returned zero matches.
   */
  findOneAndDelete(
    query: object,
    options?: RemoteFindOneAndModifyOptions
  ): Promise<DocumentT | null>;


  /**
   * Aggregates documents according to the specified aggregation pipeline.
   *
   * Stitch supports a subset of the available aggregation stages in MongoDB.
   * See 
   * [Unsupported Aggregation Stages](https://docs.mongodb.com/stitch/mongodb/actions/collection.aggregate/#unsupported-aggregation-stages).
   *
   * @param pipeline the aggregation pipeline
   * @return a read operation which can be used to execute the aggregation
   */
  aggregate(pipeline: object[]): RemoteMongoReadOperation<DocumentT>;

  /**
   * Inserts the provided document. If the document is missing an identifier, the client should
   * generate one.
   *
   * @param document the document to insert
   * @return a Promise containing the result of the insert one operation
   */
  insertOne(document: DocumentT): Promise<RemoteInsertOneResult>;

  /**
   * Inserts one or more documents.
   *
   * @param documents the documents to insert
   * @return a Promise containing the result of the insert many operation
   */
  insertMany(documents: DocumentT[]): Promise<RemoteInsertManyResult>;

  /**
   * Removes at most one document from the collection that matches the given filter.
   * If no documents match, the collection is not modified.
   *
   * @param query the query filter to apply the the delete operation
   * @return a Promise containing the result of the remove one operation
   */
  deleteOne(query: object): Promise<RemoteDeleteResult>;

  /**
   * Removes all documents from the collection that match the given query filter.  If no documents
   * match, the collection is not modified.
   *
   * @param query the query filter to apply the the delete operation
   * @return a Promise containing the result of the remove many operation
   */
  deleteMany(query: object): Promise<RemoteDeleteResult>;

  /**
   * Update a single document in the collection according to the specified arguments.
   *
   * @param query         a document describing the query filter, which may not be null.
   * @param update        a document describing the update, which may not be null. The update to
   *                      apply must include only update operators.
   * @param updateOptions the options to apply to the update operation
   * @return a Promise containing the result of the update one operation
   */
  updateOne(
    query: object,
    update: object,
    updateOptions?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult>;

  /**
   * Update all documents in the collection according to the specified arguments.
   *
   * @param query         a document describing the query filter, which may not be null.
   * @param update        a document describing the update, which may not be null. The update to
   *                     apply must include only update operators.
   * @param updateOptions the options to apply to the update operation
   * @return a Promise containing the result of the update many operation
   */
  updateMany(
    query: object,
    update: object,
    updateOptions?: RemoteUpdateOptions
  ): Promise<RemoteUpdateResult>;

  /**
   * Opens a MongoDB change stream against the collection to watch for changes.
   * You can watch a subset of the documents in the collection by passing
   * an array of specific document ids or a
   * [match expression](https://docs.mongodb.com/manual/reference/operator/aggregation/match/)
   * that filters the [[ChangeEvent]]s from the change stream.
   *
   * Defining the match expression to filter ChangeEvents is similar to
   * defining the match expression for [triggers](https://docs.mongodb.com/stitch/triggers/database-triggers/).
   *
   * @param arg Optional. An array of ids to watch or a $match expression filter.
   *            Omit to watch the entire collection.
   * @return a Promise containing a stream of change events representing the 
   *         changes to the watched documents.
   */
  watch(arg?: any[] | object | undefined): Promise<Stream<ChangeEvent<DocumentT>>>;

  /**
   * Opens a MongoDB change stream against the collection to watch for changes 
   * made to specific documents. The documents to watch must be explicitly 
   * specified by their _id.
   * 
   * Requests a stream where the full document of update events, and several 
   * other unnecessary fields are omitted from the change event objects 
   * returned by the server. This can save on network usage when watching
   * large documents.
   *
   * @note
   * This method does not support opening change streams on an entire collection
   * or a specific query.
   *
   * @param ids the _ids of the documents to watch in this change stream
   * @return a Promise containing a stream of compact change events 
   *         representing the changes to the watched documents.
   */
  watchCompact(ids: any[]): Promise<Stream<CompactChangeEvent<DocumentT>>>;
}
