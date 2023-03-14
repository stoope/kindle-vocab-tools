import sqlite from "sqlite3";

export interface KindleVocabToolsInitProps {
  /**
   * Path to the `vocab.db` file
   * `/Volumes/Kindle/system/vocabulary/vocab.db` is default path on `MacOS`
   */
  pathToDB: string;
}

export interface Book {
  id: string;
  title: string;
  lang: string;
  authors: string;
}

export interface Lookup {
  word_key: string;
  /**
   * Sentence in the book where the word has been found
   */
  usage: string;
  timestamp: number;
  /**
   * Word in original form in the sentence
   */
  word: string;
  /**
   * Stem of the word
   */
  stem: string;
  book_title: string;
}

export default class KindleVocabTools {
  private path: string;
  private db: sqlite.Database | null;
  private initialized: boolean;

  constructor({ pathToDB }: KindleVocabToolsInitProps) {
    this.path = pathToDB;
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initializes connection to `vocab.db` database.
   * Must be called and awaited before using rest of the API's
   */
  public async init() {
    return new Promise<void>((resolve, reject) => {
      this.initialized = false;
      this.db = new (sqlite.verbose().Database)(this.path, (err) => {
        if (err !== null) {
          reject(err);
        } else {
          this.initialized = true;
          resolve();
        }
      });
    });
  }

  /**
   * Returns all the lookups.
   */
  public async getAllLookups() {
    this.checkInit();

    return new Promise<Lookup[]>((resolve, reject) => {
      this.db?.all(
        `SELECT word_key, usage, LOOKUPS.timestamp, WORDS.word, WORDS.stem FROM LOOKUPS
        INNER JOIN WORDS on WORDS.id=LOOKUPS.word_key
        ORDER BY LOOKUPS.timestamp`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * Returns all the lookups for a specific book.
   * @param bookId id of the book. Could be found as `id` prop of `Book` type
   */
  public async getLookupsByBookId(bookId: string) {
    this.checkInit();

    return new Promise<Lookup[]>((resolve, reject) => {
      this.db?.all(
        `SELECT word_key, usage, LOOKUPS.timestamp, WORDS.word, WORDS.stem, BOOK_INFO.title AS book_title FROM LOOKUPS
        INNER JOIN WORDS on WORDS.id=LOOKUPS.word_key
        INNER JOIN BOOK_INFO on LOOKUPS.book_key=BOOK_INFO.id
        WHERE LOOKUPS.book_key="${bookId}"
        ORDER BY LOOKUPS.timestamp`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * Returns all the books
   */
  public async getAllBooks() {
    this.checkInit();

    return new Promise<Book[]>((resolve, reject) => {
      this.db?.all(
        "SELECT title, lang, authors, id FROM BOOK_INFO GROUP BY asin",
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * Deletes book and all the lookups connected with it.
   * @param bookId id of the book. Could be found as `id` prop of `Book` type
   */
  public async deleteBookWithLookups(bookId: string) {
    this.checkInit();

    await this.deleteWordsByBookId(bookId);
    await this.deleteLookupsByBookId(bookId);
    await this.deleteBookById(bookId);
  }

  /**
   * Deletes all words.
   */
  public async deleteWords() {
    this.checkInit();

    return new Promise<void>((resolve, reject) => {
      this.db?.all(`DELETE FROM WORDS`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Deletes words by `bookId`.
   * @param bookId id of the book. Could be found as `id` prop of `Book` type
   */
  public async deleteWordsByBookId(bookId: string) {
    this.checkInit();

    return new Promise<void>((resolve, reject) => {
      this.db?.all(
        `DELETE FROM WORDS
        WHERE id IN ( SELECT word_key from LOOKUPS WHERE LOOKUPS.book_key="${bookId}")`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Deletes all books.
   */
  public async deleteBooks() {
    this.checkInit();

    return new Promise<void>((resolve, reject) => {
      this.db?.all(`DELETE FROM BOOK_INFO`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Deletes a book.
   * @param bookId id of the book. Could be found as `id` prop of `Book` type
   */
  public async deleteBookById(bookId: string) {
    this.checkInit();

    return new Promise<void>((resolve, reject) => {
      this.db?.all(
        `DELETE FROM BOOK_INFO
        WHERE BOOK_INFO.id="${bookId}"`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Deletes all lookups.
   */
  public async deleteLookups() {
    this.checkInit();

    return new Promise<void>((resolve, reject) => {
      this.db?.all(`DELETE FROM LOOKUPS`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Deletes lookup by `id`.
   * @param id id of the lookup
   */
  public async deleteLookupById(id: string) {
    this.checkInit();

    return new Promise<void>((resolve, reject) => {
      this.db?.all(
        `DELETE FROM LOOKUPS
        WHERE LOOKUPS.id="${id}"`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Deletes lookups by `bookId`.
   * @param bookId id of the book. Could be found as `id` prop of `Book` type
   */
  public async deleteLookupsByBookId(bookId: string) {
    this.checkInit();

    return new Promise<void>((resolve, reject) => {
      this.db?.all(
        `DELETE FROM LOOKUPS
        WHERE LOOKUPS.book_key="${bookId}"`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  private checkInit() {
    if (!this.initialized || !this.db) {
      throw new Error(
        "You must initialize a KindleVocabTools before using it. Try waiting for 'init' method to finish"
      );
    }
  }
}
