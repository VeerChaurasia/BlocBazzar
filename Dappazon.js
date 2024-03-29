const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ID =1
const NAME = "Jacket" 
const CATEGORY = "Clothing"
const IMAGE= ""
const COST = tokens(1)
const RATING = 4
const STOCK = 5

describe("BlocBazzar", () => {
  let blocbazzar
  let deployer , buyer

  before(async () =>{
    [deployer, buyer] = await ethers.getSigners()
    
    const BlocBazzar = await ethers.getContractFactory("BlocBazzar")
    blocbazzar = await BlocBazzar.deploy()
    await blocbazzar.deployed()
    console.log("BlocBazzar deployed at:", blocbazzar.address);
    console.log("Deployer address:", deployer.address);
  })


  describe("Deployment",() => {
    it("Sets the owner",async() => {
      console.log("Owner before:", await blocbazzar.owner());
      expect(await blocbazzar.owner()).to.equal(deployer.address)
    })
  })

  describe("Listing", () =>{ 
    let transaction

    

    beforeEach(async () =>{
      transaction =  await blocbazzar.connect(deployer).list(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )

      await transaction.wait()
      })  
      

    it("Returns item attributes", async () =>{
      const item = await blocbazzar.items(1)
      
      expect(item.id).to.equal(ID)
      expect(item.name).to.equal(NAME)
      expect(item.category).to.equal(CATEGORY)
      expect(item.image).to.equal(IMAGE)
      expect(item.cost).to.equal(COST)
      expect(item.rating).to.equal(RATING)
      expect(item.stock).to.equal(STOCK)
      
    })

    it("Emits List event", () => {
      expect(transaction).to.emit(blocbazzar, )
    })

    

  })

  describe("Buying",()=>{
    let transaction

    beforeEach(async () =>{
      transaction = await blocbazzar.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);  
       await transaction.wait() 
      
      transaction = await blocbazzar.connect(buyer).buy(ID, {value: COST})

    })
  
    it("Updates the contract balance", async () => {
    const result = await ethers.provider.getBalance(blocbazzar.address)
    expect(result).to.equal(COST)
    
    })

    it("Updates buyer's order count", async () =>{
      const result = await blocbazzar.orderCount(buyer.address)
      expect(result).to.equal(2)
    })
    it("Adds the order", async() => {
      const order = await blocbazzar.orders(buyer.address, 1)

      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })
    it("Emits Buy event", () =>{
      expect(transaction).to.emit(blocbazzar,"Buy")
    })  
  });

  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // List a item
      let transaction = await blocbazzar.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // Buy a item
      transaction = await blocbazzar.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // Withdraw
      transaction = await blocbazzar.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(blocbazzar.address)
      expect(result).to.equal(0)
    })
  })
  
})