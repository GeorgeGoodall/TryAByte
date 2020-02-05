pragma solidity ^0.5.9;

contract StructureInterface {
    function getValue(uint256 _id) public view returns (uint256);
}

/**
 * @title StructuredLinkedList
 * @author Vittorio Minacori (https://github.com/vittominacori)
 * @dev An utility library for using sorted linked list data structures in your Solidity project.
 */

 /*
 * @dev extended by George Goodall
 */
library StructuredLinkedList {

    uint256 private constant NULL = 0;
    uint256 private constant HEAD = 0;

    bool private constant PREV = false;
    bool private constant NEXT = true;

    struct List {
        mapping(uint256 => mapping(bool => uint256)) list;
    }

    /**
     * @dev Checks if the list exists
     * @param self stored linked list from contract
     * @return bool true if list exists, false otherwise
     */
    function listExists(List storage self) internal view returns (bool) {
        // if the head nodes previous or next pointers both point to itself, then there are no items in the list
        if (self.list[HEAD][PREV] != HEAD || self.list[HEAD][NEXT] != HEAD) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Checks if the node exists
     * @param self stored linked list from contract
     * @param _node a node to search for
     * @return bool true if node exists, false otherwise
     */
    function nodeExists(List storage self, uint256 _node) internal view returns (bool) {
        if (self.list[_node][PREV] == HEAD && self.list[_node][NEXT] == HEAD) {
            if (self.list[HEAD][NEXT] == _node) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    /**
     * @dev Returns the number of elements in the list
     * @param self stored linked list from contract
     * @return uint256
     */
    function sizeOf(List storage self) internal view returns (uint256) {
        bool exists;
        uint256 i;
        uint256 numElements;
        (exists, i) = getAdjacent(self, HEAD, NEXT);
        while (i != HEAD) {
            (exists, i) = getAdjacent(self, i, NEXT);
            numElements++;
        }
        return numElements;
    }

    /**
     * @dev Returns the links of a node as a tuple
     * @param self stored linked list from contract
     * @param _node id of the node to get
     * @return bool, uint256, uint256 true if node exists or false otherwise, previous node, next node
     */
    function getNode(List storage self, uint256 _node) internal view returns (bool, uint256, uint256) {
        if (!nodeExists(self, _node)) {
            return (false, 0, 0);
        } else {
            return (true, self.list[_node][PREV], self.list[_node][NEXT]);
        }
    }

    /**
     * @dev Returns the link of a node `_node` in direction `_direction`.
     * @param self stored linked list from contract
     * @param _node id of the node to step from
     * @param _direction direction to step in
     * @return bool, uint256 true if node exists or false otherwise, node in _direction
     */
    function getAdjacent(List storage self, uint256 _node, bool _direction) internal view returns (bool, uint256) {
        if (!nodeExists(self, _node)) {
            return (false, 0);
        } else {
            return (true, self.list[_node][_direction]);
        }
    }

    /**
     * @dev Returns the link of a node `_node` in direction `NEXT`.
     * @param self stored linked list from contract
     * @param _node id of the node to step from
     * @return bool, uint256 true if node exists or false otherwise, next node
     */
    function getNextNode(List storage self, uint256 _node) internal view returns (bool, uint256) {
        return getAdjacent(self, _node, NEXT);
    }

    /**
     * @dev Returns the link of a node `_node` in direction `PREV`.
     * @param self stored linked list from contract
     * @param _node id of the node to step from
     * @return bool, uint256 true if node exists or false otherwise, previous node
     */
    function getPreviousNode(List storage self, uint256 _node) internal view returns (bool, uint256) {
        return getAdjacent(self, _node, PREV);
    }

    /**
     * @dev Can be used before `insert` to build an ordered list.
     * @dev Get the node and then `insertBefore` or `insertAfter` basing on your list order.
     * @dev If you want to order basing on other than `structure.getValue()` override this function
     * @param self stored linked list from contract
     * @param _structure the structure instance
     * @param _value value to seek
     * @return uint256 next node with a value less than _value
     */
    function getSortedSpot(List storage self, address _structure, uint256 _value) internal view returns (uint256) {
        if (sizeOf(self) == 0) {
            return 0;
        }
        bool exists;
        uint256 next;
        (exists, next) = getAdjacent(self, HEAD, NEXT);
        while ((next != 0) && ((_value < StructureInterface(_structure).getValue(next)) != NEXT)) {
            next = self.list[next][NEXT];
        }
        return next;
    }

    /**
     * @dev Creates a bidirectional link between two nodes on direction `_direction`
     * @param self stored linked list from contract
     * @param _node first node for linking
     * @param _link  node to link to in the _direction
     */
    function createLink(List storage self, uint256 _node, uint256 _link, bool _direction) internal {
        self.list[_link][!_direction] = _node;
        self.list[_node][_direction] = _link;
    }

    /**
     * @dev Insert node `_new` beside existing node `_node` in direction `_direction`.
     * @param self stored linked list from contract
     * @param _node existing node
     * @param _new  new node to insert
     * @param _direction direction to insert node in
     * @return bool true if success, false otherwise
     */
    function insert(List storage self, uint256 _node, uint256 _new, bool _direction) internal returns (bool) {
        if (!nodeExists(self, _new) && nodeExists(self, _node)) {
            uint256 c = self.list[_node][_direction];
            createLink(self, _node, _new, _direction);
            createLink(self, _new, c, _direction);
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Insert node `_new` beside existing node `_node` in direction `NEXT`.
     * @param self stored linked list from contract
     * @param _node existing node
     * @param _new  new node to insert
     * @return bool true if success, false otherwise
     */
    function insertAfter(List storage self, uint256 _node, uint256 _new) internal returns (bool) {
        return insert(self, _node, _new, NEXT);
    }

    /**
     * @dev Insert node `_new` beside existing node `_node` in direction `PREV`.
     * @param self stored linked list from contract
     * @param _node existing node
     * @param _new  new node to insert
     * @return bool true if success, false otherwise
     */
    function insertBefore(List storage self, uint256 _node, uint256 _new) internal returns (bool) {
        return insert(self, _node, _new, PREV);
    }

    /**
     * @dev Removes an entry from the linked list
     * @param self stored linked list from contract
     * @param _node node to remove from the list
     * @return uint256 the removed node
     */
    function remove(List storage self, uint256 _node) internal returns (uint256) {
        if ((_node == NULL) || (!nodeExists(self, _node))) {
            return 0;
        }
        createLink(self, self.list[_node][PREV], self.list[_node][NEXT], NEXT);
        delete self.list[_node][PREV];
        delete self.list[_node][NEXT];
        return _node;
    }

    /**
     * @dev Pushes an entry to the head of the linked list
     * @param self stored linked list from contract
     * @param _node new entry to push to the head
     * @param _direction push to the head (NEXT) or tail (PREV)
     * @return bool true if success, false otherwise
     */
    function push(List storage self, uint256 _node, bool _direction) internal returns (bool) {
        return insert(self, HEAD, _node, _direction);
    }

    /**
     * @dev Pops the first entry from the linked list
     * @param self stored linked list from contract
     * @param _direction pop from the head (NEXT) or the tail (PREV)
     * @return uint256 the removed node
     */
    function pop(List storage self, bool _direction) internal returns (uint256) {
        bool exists;
        uint256 adj;
        (exists, adj) = getAdjacent(self, HEAD, _direction);
        return remove(self, adj);
    }

    // extra functionality added by George Goodall

    /**
     * @dev returns an array of the list values
     * @param self stored linked list from contract
     * @return uint256[] the values in the list
     */
    function getListValues(List storage self) internal view returns (uint256[] memory){
        bool exists;
        uint256 i;
        uint256 index;
        uint256[] memory values = new uint256[](sizeOf(self));
        (exists, i) = getAdjacent(self, HEAD, NEXT);
        while (i != HEAD && exists) {
            values[index]=i;
            index++;
            (exists, i) = getAdjacent(self, i, NEXT);
        }
        return values;
    }

    /**
     * @dev returns the item at the index
     * @param self stored linked list from contract
     * @param index of the item
     * @return uint, the item
     */
    function getValueAtIndex(List storage self, uint index) internal view returns (uint){
        bool exists;
        uint256 toReturn;
        uint256[] memory values = new uint256[](sizeOf(self));
        (exists, toReturn) = getAdjacent(self, HEAD, NEXT); 
        for(uint i = 0; i < index; i++){
            (exists, toReturn) = getAdjacent(self, toReturn, NEXT); 
        }
        return toReturn;
    }

    /**
     * @dev Swaps two items position in the list
     * @param self stored linked list from contract
     * @param item1 the first item that is going to be swapped
     * @param item2 the second item that is going to be swapped 
     * @return bool the status of the function
     */
    function swapIndexs(List storage self, uint item1, uint item2) internal returns (bool){
        if (nodeExists(self, item1) && nodeExists(self, item2)) {
            if(item1 == item2)
                return true;
            else if(self.list[item1][NEXT] == item2){
                self.list[item1][NEXT] = self.list[item2][NEXT];
                self.list[item2][PREV] = self.list[item1][PREV];
                
                self.list[self.list[item1][NEXT]][PREV] = item1;
                self.list[self.list[item2][PREV]][NEXT] = item2;
                
                self.list[item2][NEXT] = item1;
                self.list[item1][PREV] = item2;
            }
            else if(self.list[item2][NEXT] == item1){
                self.list[item2][NEXT] = self.list[item1][NEXT];
                self.list[item1][PREV] = self.list[item2][PREV];
                
                self.list[self.list[item2][NEXT]][PREV] = item2;
                self.list[self.list[item1][PREV]][NEXT] = item1;
                
                self.list[item1][NEXT] = item2;
                self.list[item2][PREV] = item1;
            }
            else{
                uint temp1 = self.list[item2][PREV];
                uint temp2 = self.list[item2][NEXT];
                
                self.list[item2][PREV] = self.list[item1][PREV];
                self.list[item2][NEXT] = self.list[item1][NEXT];
                
                self.list[item1][PREV] = temp1;
                self.list[item1][NEXT] = temp2;
                
                self.list[self.list[item2][NEXT]][PREV] = item2;
                self.list[self.list[item2][PREV]][NEXT] = item2;
                
                self.list[self.list[item1][NEXT]][PREV] = item1;
                self.list[self.list[item1][PREV]][NEXT] = item1;
            }
            return true;
        } else {
            return false;
        }
    }
}