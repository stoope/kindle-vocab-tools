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
        `SELECT word_key, usage, LOOKUPS.timestamp, WORDS.word, WORDS.stem, BOOK_INFO.title AS book_title FROM LOOKUPS
        INNER JOIN WORDS on WORDS.id=LOOKUPS.word_key
        INNER JOIN BOOK_INFO on LOOKUPS.book_key=BOOK_INFO.id
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
  public async getLookupsByBook(bookId: string) {
    this.checkInit();

    return new Promise<Lookup[]>((resolve, reject) => {
      this.db?.all(
        `SELECT word_key, usage, LOOKUPS.timestamp, WORDS.word, WORDS.stem, BOOK_INFO.title AS book_title FROM LOOKUPS
        INNER JOIN WORDS on WORDS.id=LOOKUPS.word_key
        INNER JOIN BOOK_INFO on LOOKUPS.book_key=BOOK_INFO.id
        WHERE lookups.book_key="${bookId}"
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

  private checkInit() {
    if (!this.initialized || !this.db) {
      throw new Error(
        "You must initialize a KindleVocabTools before using it. Try waiting for 'init' method to finish"
      );
    }
  }
}
