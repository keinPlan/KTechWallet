import *  as helper from "./Helper";

it("BinaryReaderWriter ReadWriteByte", () => {
    let rw = new helper.BinaryReaderWriter();
    rw.AddByte(11);
    rw.index = 0;
    expect(rw.ReadByte()).toBe(11);
    rw.index = 0;
    rw.AddByte(255);
    rw.index = 0;
    expect(rw.ReadByte()).toBe(255);
});

it("BinaryReaderWriter ReadWriteunit16", () => {
    let rw = new helper.BinaryReaderWriter();
    rw.AddUInt16(0xffff);
    rw.index = 0;
    expect(rw.ReadUInt16()).toBe(0xffff);
    rw.index = 0;
    rw.AddUInt16(0x1234);
    rw.index = 0;
    expect(rw.ReadUInt16()).toBe(0x1234);
});

it("BinaryReaderWriter ReadWriteunit32", () => {
    let rw = new helper.BinaryReaderWriter();
    rw.AddUInt32(0xffffffff);
    rw.index = 0;
    expect(rw.ReadUInt32()).toBe(0xffffffff);
    rw.index = 0;
    rw.AddUInt32(0x12345678);
    rw.index = 0;
    expect(rw.ReadUInt32()).toBe(0x12345678);
});


it("BinaryReaderWriter ReadWriteunit64", () => {
    let rw = new helper.BinaryReaderWriter();

    rw.AddUInt64(0x1FFFFFffffffff);
    rw.index = 0;
    expect(rw.ReadUInt64()).toBe(0x1FFFFFffffffff);
    rw.index = 0;
    //           0x1FFFFFffffffff
    rw.AddUInt64(0x1a5aa5a55a5aa5);
    rw.index = 0;
    expect(rw.ReadUInt64()).toBe(0x1a5aa5a55a5aa5);
    rw.index = 0;
    //           0x1FFFFFffffffff
    rw.AddUInt64(0x12345678abcdef);
    rw.index = 0;
    expect(rw.ReadUInt64()).toBe(0x12345678abcdef);

    expect(() => rw.AddUInt64(0x1FFFFFffffffff + 1)).toThrowError("number to big to handle");
    rw.index = 0;
    rw.AddBytes(new Uint8Array(8).fill(0xff));
    rw.index = 0;
    expect(() => rw.ReadUInt64()).toThrowError("number to big to handle");
});







