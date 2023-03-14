# kindle-vocab-tools

Set of tools to work with Kindle Vocabulary Builder.

## Prerequisites

Before using the library, make sure you have access to the `vocab.db` file from Kindle. The easiest way is to plug in your Kindle device and find the file at `/Volumes/Kindle/system/vocabulary/vocab.db` (default path on `MacOS`).

## Install

```bash
npm install kindle-vocab-tools
```

## Using

```typescript
import KindleVocabTools from "kindle-vocab-tools";

const db = new KindleVocabTools({
  pathToDB: "/Volumes/Kindle/system/vocabulary/vocab.db",
});

await db.init();

const books = await db.getAllBooks();

for (const book of books) {
  const lookups = await db.getLookupsByBook(book.id);

  console.log(lookups);
}
```

## API

### `init(): Promise<void>`

Initializes connection to `vocab.db` database.
Must be called and awaited before using rest of the API's

### `getAllBooks(): Promise<Book[]>`

Returns all the books.

### `getAllLookups(): Promise<Lookup[]>`

Returns all the lookups.

### `getLookupsByBookId(bookId: string): Promise<Lookup[]>`

Returns all the lookups for a specific book.

`bookId` could be found as `id` prop of `Book` type

### `deleteBookWithLookups(bookId: string): Promise<void>`

Deletes book and all the lookups connected with it.

### `deleteWords(): Promise<void>`

Deletes all words.

### `deleteWordsByBookId(bookId: string): Promise<void>`

Deletes words by `bookId`.

### `deleteBookById(bookId: string): Promise<void>`

Deletes a book.
`bookId` could be found as `id` prop of `Book` type

### `deleteLookups(): Promise<void>`

Deletes all lookups.

### `deleteLookupById(id: string): Promise<void>`

Deletes lookup by `id`.

### `deleteLookupsByBookId(bookId: string): Promise<void>`

Deletes lookups by `bookId`.

`bookId` could be found as `id` prop of `Book` type
