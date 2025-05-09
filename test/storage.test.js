
import storage from "../js/storage.js";

describe("storage classs",() =>{
    beforeEach(()=> {
        localStorage.clear(); // Clear localStorage before each test
    });

    test('should save and rescieve user name',()=>{
        const userName ='ewurasi';

        storage.saveUserName(userName);
        const retrievedName = storage.getUserName();
        expect(retrievedName).toBe(userName);
    })

    test('return an empty array if there is no habit',()=>{
        const habits=storage.getHabits();
        expect(habits).toEqual([]);
    })

//     test('should delete a habit',()=>{
//        const habit1 ={id:'1',name:'finish lab',streak:2, days:[1,3],completed:false}; 
//        const habit2 ={id:'2',name:'have a group checkin',streak:1, days:[4],completed:false};
//        const habits=[habit1,habit2];
//        localStorage
// .setItem('habits',JSON.stringify(habits));

//  const deleteHabit=storage.deleteHabit(habit2.id);
//        expect(deleteHabit).toEqual([habit1]);
//     //    expect(storage.getHabits()).toContain(habit1.id);
//        const currentHabits = Storage.getHabits();
//        expect(currentHabits).toHaveLength(1);
//        expect(currentHabits[0].id).toBe(habit1.id);})

    test('should save habits',()=>{
        const habit1 ={id:'1',name:'finish lab',streak:2, days:[1,3],completed:false};
        const habit2 ={id:'2',name:'have a group checkin',streak:1, days:[4],completed:false};
        const habits=[habit1,habit2];
        storage.saveHabits(habits);
        const retrievedHabits = storage.getHabits();
        expect(retrievedHabits).toEqual(habits);
    })

})