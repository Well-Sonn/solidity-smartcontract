// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//
contract SimpleVoting {
    
    uint public counter = 0;

    mapping(uint => mapping(uint => uint)) private _tally;
    mapping(uint => mapping(address => bool)) public hasVoted;
    mapping(uint => Ballot) private _ballots;

    struct Ballot{
        string question; 
        string[] options; 
        uint startTime;
        uint duration; 
    }

    function createBallot(string memory question_, string[] memory options_, uint startTime_, uint duration_) external{
        require(duration_ > 0, "Duracao invalida, deve ser maior que 0");
        require(options_.length >= 2, "Opcao invalida, deve conter no minimo 2 opcoes");
        _ballots[counter] = Ballot(question_, options_, startTime_, duration_);
        counter++;
    }

    function getBallotByIndex(uint index_) external view returns(Ballot memory ballot){
        ballot = _ballots[index_];
    }

    function cast(uint ballotIndex_, uint optionIndex_) external{
        require(!hasVoted[ballotIndex_][msg.sender], "Erro: Este endereco ja votou nessa enquete");
        Ballot memory ballot = _ballots[ballotIndex_];
        _tally[ballotIndex_][optionIndex_]++;
        hasVoted[ballotIndex_][msg.sender] = true;
    }

    function getTally(uint ballotIndex_, uint optionIndex_) external view returns(uint){
        return _tally[ballotIndex_][ optionIndex_];
    }

    function results(uint ballotIndex_) external view returns(uint[]memory){
        Ballot memory ballot = _ballots[ballotIndex_];
        uint len = ballot.options.length;
        uint[]memory result = new uint[](len);
        for(uint i=0; i < len; i++){
            result[i] = _tally[ballotIndex_][i];
        }
        return result;
    }

    function winners(uint ballotIndex_) external view returns(bool[] memory){
        Ballot memory ballot = _ballots[ballotIndex_];
        uint len = ballot.options.length;
        uint[]memory result = new uint[](len);
        uint max;
        for(uint i=0; i<len; i++){
            result[i] = _tally[ballotIndex_][i];
            if(result[i] > max){
                max = result[i];
            }
        }
        bool[] memory winner = new bool[](len);
        for(uint i=0; i<len; i++){
            if(result[i] == max){
                winner[i] = true; 
            }
        }
        return winner;
    }

}