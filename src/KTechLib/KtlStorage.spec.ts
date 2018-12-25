import { KtlStorageDummy, KtlStorageWindowLocalStorage, IKtlStorage } from "./KtlStorage";

let testdata =
    [
        [
            "KtlStorageDummy",
            new KtlStorageDummy()
        ],
        [
            "KtlStorageWindowLocalStorage",
            new KtlStorageWindowLocalStorage()
        ]

    ];


describe.each(testdata)("Test Storage", (name: string, storage: IKtlStorage) => {

    it("Test %s Load/Save", () => {
        let value: string | null;

        value = storage.Load("test");
        expect(value).toBeNull();

        storage.Save("test", "testdata");

        value = storage.Load("test");
        expect(value).toBe("testdata");
    });
});

