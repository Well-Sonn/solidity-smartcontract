import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("SimpleVoting", function(){
    async function deploy() {
        const Contract = await ethers.getContractFactory("SimpleVoting");
        const contract = await Contract.deploy();
        return { contract };
    }
    

    describe("Criando enquetes", function(){
        it("Criando uma nova votacao",async function() {
            const {contract} = await loadFixture(deploy);
            const startTime = await time.latest() + 60;
            const duration = 300
            const question = "Qual Banco usado por você atualmente?"
            const option = [
                "Bradesco",
                "Itau",
                "Santander",
                "Caixa",
                "Banco do Brasil"
            ]
            
            await contract.createBallot(
                question, option, startTime, duration
            )
            expect(await contract.getBallotByIndex(0)).to.deep.eq([
                question,
                option,
                BigNumber.from(startTime),
                BigNumber.from(duration),
            ])

        })

        it("Reverter form se nao tiver no minimo duas opcoes", async function(){
            const {contract} = await loadFixture(deploy);
            const startTime = await time.latest() + 60;
            const duration = 300
            const question = "Qual Banco usado por você atualmente?"
            const option = [
                "Bradesco",
                //"Itau",
                //"Santander",
                //"Caixa",
                //"Banco do Brasil"
            ]
            await expect(contract.createBallot(question, option, startTime, duration)).to.be.rejectedWith("Opcao invalida, deve conter no minimo 2 opcoes")
        })
    })

    describe("Testando o voto", function(){
        let contract: Contract;
        const duration = 300;

        beforeEach(async function(){
            const {contract} = await loadFixture(deploy);
            const startTime = await time.latest() + 60
            const duration = 300
            const question = "Qual Banco usado por você atualmente?"
            const option = [
                "Bradesco",
                "Itau",
                "Santander",
                "Caixa",
                "Banco do Brasil"
            ]
            
            await contract.createBallot(
                question, option, startTime, duration
            )
        })

        it("Votando", async function(){
            const[signer] = await ethers.getSigners()
            await time.increase(61);
            await contract.cast(0, 0);
            expect(await contract.hasVoted(0, signer.address)).to.eq(true);
            expect(await contract.getTally(0, 0)).to.eq(1);
        })

        it("Reverter voto duplo", async function(){
            await time.increase(61);
            await contract.cast(0, 0);
            await expect(contract.cast(0, 1)).to.be.rejectedWith("Erro: Este endereco ja votou nessa enquete")
        })

    })

    describe("Validando Ganhadores", function(){
        let contract: Contract;
        const duration = 300;

        beforeEach(async function(){
            const {contract} = await loadFixture(deploy);
            const startTime = await time.latest() + 60
            const duration = 300
            const question = "Qual Banco usado por você atualmente?"
            const option = [
                "Bradesco",
                "Itau",
                "Santander",
                "Caixa",
                "Banco do Brasil"
            ]
            
            await contract.createBallot(
                question, option, startTime, duration
            )
            await time.increase(200);
            const signer = await ethers.getSigners();
            await contract.cast(0, 0)
            await contract.cast(signer[1]).cast(0, 0)
            await contract.cast(signer[2]).cast(0, 1)
            await contract.cast(signer[3]).cast(0, 2)
        })

    it("Testando computacao dos votos", async function(){
        await time.increase(2000)
        expect(await contract.results(0)).to.deep.eq([
            BigNumber.from(2),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(2),
            BigNumber.from(0),
        ])
    })

    it("Testando validacao do ganhador", async function(){
        await time.increase(2000);
        expect(await contract.winner(0)).to.deep.eq([true, false, false, false])
    })

    })

})