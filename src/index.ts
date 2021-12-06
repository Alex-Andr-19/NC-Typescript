const body: HTMLElement = document.getElementsByTagName("body")[0];
// @ts-ignore
const treeBlock: HTMLElement = document.getElementById("tree_block");

class MyNode<T> {
    private readonly _id: number;
    private _value: T;
    private _leftLeaf: MyNode<T> | null;
    private _rightLeaf: MyNode<T> | null;
    private _parent: MyNode<T> | null;

    constructor(id: number, value: T) {
        this._id = id;
        this._value = value;
        this._leftLeaf = null;
        this._rightLeaf = null;
        this._parent = null;
    }

    get id(): number {
        return this._id;
    }

    get value(): T {
        return this._value;
    }

    set value(value: T) {
        this._value = value;
    }

    get leftLeaf(): MyNode<T> | null {
        return this._leftLeaf;
    }

    set leftLeaf(node: MyNode<T> | null) {
        this._leftLeaf = node;
    }

    get rightLeaf(): MyNode<T> | null {
        return this._rightLeaf;
    }

    set rightLeaf(node: MyNode<T> | null) {
        this._rightLeaf = node;
    }

    get parent(): MyNode<T> | null {
        return this._parent;
    }

    set parent(node: MyNode<T> | null) {
        this._parent = node;
    }
}

class Tree<T> {
    private _root: MyNode<T> | null;
    private _deep: number;
    private _lvlsList: [(MyNode<T> | null)[]];

    constructor(rootInput: MyNode<T> | null) {
        this._root = rootInput;
        if (this._root) {
            this._deep = 1;
            this._lvlsList = [[this._root]];
        } else {
            this._deep = 0;
            this._lvlsList = [[]];
        }

    }

    get root(): MyNode<T> | null {
        return this._root;
    }

    get deep(): number {
        return this._deep;
    }

    get lvlsList(): [(MyNode<T> | null)[]] {
        return this._lvlsList;
    }

    private _compileLvlList(node: MyNode<T> | null, lvlsListIndex: number, curDeep: number): void {
        if (node) {
            if (!this._lvlsList[curDeep]) {
                for (let i: number = 0; i < 2 ** curDeep; i++) {
                    this._lvlsList[curDeep].push(null);
                }
            }
            this._lvlsList[curDeep][lvlsListIndex] = node;

            this._compileLvlList(node.leftLeaf, lvlsListIndex * 2, curDeep + 1);
            this._compileLvlList(node.rightLeaf, (lvlsListIndex * 2) + 1, curDeep + 1);
        }
    }

    append(node: MyNode<T>): boolean {
        let res: boolean = false;

        if (!this._root) {
            this._root = node;
            this._deep = 1;
            res = true;
        } else {
            let curNode: MyNode<T> | null = this._root;
            let nextNode: MyNode<T> | null = curNode.value > node.value ? curNode.leftLeaf : curNode.rightLeaf;

            let curDeep: number = 1;
            while (nextNode && curNode.value !== node.value) {
                if (nextNode.value > node.value) {
                    curNode = nextNode;
                    nextNode = nextNode.leftLeaf;
                } else {
                    curNode = nextNode;
                    nextNode = nextNode.rightLeaf;

                }
                curDeep++;
            }

            if (curNode.value !== node.value) {

                node.parent = curNode;
                if (curNode.value > node.value) {
                    curNode.leftLeaf = node;
                } else {
                    curNode.rightLeaf = node;
                }
                curDeep++;

                if (!this._lvlsList[curDeep - 1]) {
                    this._lvlsList.push([]);
                    for (let i = 0; i < 2 ** (curDeep - 1); i++) {
                        this._lvlsList[curDeep - 1].push(null);
                    }
                }

                this._deep = this._deep < curDeep ? curDeep : this._deep;
                res = true;
            }
        }

        this._compileLvlList(this._root, 0, 0);
        return res;
    }

    getByID(id: number, node: MyNode<T> | null): MyNode<T> | null   {
        let res: MyNode<T> | null = node;
        if (node) {
            if (node.id === id) {
                return res;
            }

            // for ESLint
            res = this.getByID(id, node.leftLeaf);
            if (res) {
                if (res.id === id) {
                    return res;
                }
            }
            res = this.getByID(id, node.rightLeaf);
            if (res) {
                if (res.id === id) {
                    return res;
                }
            }
        }

        // for ESLint
        return res;
    }

    delByID(id: number, startNode: MyNode<T> | null): boolean {
        const curNode: MyNode<T> | null = this.getByID(id, startNode);
        if (!curNode) {
            return false;
        }
        const parNode: MyNode<T> | null = curNode.parent;

        if (parNode) {
            if (!curNode.leftLeaf && !curNode.rightLeaf) {
                this._linkNewNode(curNode, null);
            } else if (curNode.leftLeaf && curNode.rightLeaf) {
                this._delNodeWith2Leaf(curNode);
            } else {
                if (curNode.leftLeaf) {
                    this._linkNewNode(curNode, curNode.leftLeaf);
                    curNode.leftLeaf.parent = curNode.parent;
                } else {
                    this._linkNewNode(curNode, curNode.rightLeaf);
                    // @ts-ignore
                    curNode.rightLeaf.parent = curNode.parent;
                }
            }
        }

        this._compileLvlList(this._root, 0, 0);
        return true;
    }

    private _findMaxFromMin(node: MyNode<T> | null): MyNode<T> {
        if (!node) {
            throw Error("Node is Null");
        }
        if (!node.leftLeaf) {
            throw Error("Node has no leftLeaf");
        }

        let curNode: MyNode<T> | null = node.leftLeaf;

        while (curNode.rightLeaf) {
            curNode = curNode.rightLeaf;
        }

        return curNode;
    }

    private _linkNewNode(node: MyNode<T>, newNode: MyNode<T> | null): void {
        // @ts-ignore
        if (node.parent.leftLeaf === node) {
            // @ts-ignore
            node.parent.leftLeaf = newNode;
        } else {
            // @ts-ignore
            node.parent.rightLeaf = newNode;
        }
    }

    private _delNodeWith2Leaf(node: MyNode<T>): void {
        const swapNode: MyNode<T> | null = this._findMaxFromMin(node);

        if (swapNode.leftLeaf) {
            swapNode.leftLeaf.parent = swapNode.parent;
            // @ts-ignore
            swapNode.parent.rightLeaf = swapNode.leftLeaf;
        }

        if (swapNode === node.leftLeaf) {
            // @ts-ignore
            swapNode.parent.leftLeaf = null;
        } else {
            // @ts-ignore
            swapNode.parent.rightLeaf = null;
            swapNode.leftLeaf = node.leftLeaf;
            // @ts-ignore
            swapNode.leftLeaf.parent = swapNode;
        }

        swapNode.rightLeaf = node.rightLeaf;
        // @ts-ignore
        swapNode.rightLeaf.parent = swapNode;

        swapNode.parent = node.parent;

        this._linkNewNode(node, swapNode);
    }

    printAllNodes(startNode: MyNode<T> | null): void {
        if (!startNode) {
            return;
        }
        this.printAllNodes(startNode.leftLeaf);
        this.printAllNodes(startNode.rightLeaf);
    }
}

class TreeVisualiser<T> {
    private readonly _tree: Tree<T>;
    private _lvlsList: HTMLElement[];

    constructor(someTree: Tree<T>) {
        this._tree = someTree;
        this._lvlsList = [];
    }

    get tree(): Tree<T> {
        return this._tree;
    }

    get lvlsList(): HTMLElement[] {
        return this._lvlsList;
    }

    private _createLeaf(): HTMLElement {
        const leaf: HTMLElement = document.createElement("div");
        leaf.classList.add("leaf", "empty");
        leaf.innerText = "empty";

        return leaf;
    }

    private _createLvlsList(num: number): HTMLElement[] {
        const list: HTMLElement[] = [];

        for (let i: number = 0; i < num; i++) {
            const lvl = document.createElement("div");
            lvl.classList.add("flex-box");
            lvl.classList.add("margin-height");

            for (let j = 0; j < 2 ** i; j++) {
                const htmlLeaf = this._createLeaf();

                lvl.appendChild(htmlLeaf);
            }

            list.push(lvl);
        }

        return list;
    }

    private _fillVisualTree(
        node: MyNode<T> | null,
        lvlsList: HTMLElement[],
        curDeep: number): void {
        if (!node) {
            throw Error("node is Null");
        }

        const allNodeOfLvl: HTMLCollection = lvlsList[curDeep].children;

        let numLeafInLvl: number = -1;
        for (let i: number = 0; i < allNodeOfLvl.length; i++) {
            const tmpNode: MyNode<T> | null = this._tree.lvlsList[curDeep][i];

            if (tmpNode){
                if (tmpNode.id === node.id) {
                    numLeafInLvl = i;
                    break;
                }
            }

        }

        allNodeOfLvl[numLeafInLvl].classList.remove("empty");
        allNodeOfLvl[numLeafInLvl].innerHTML = `${node.id}: ${node.value}`;

        if (node.leftLeaf) {
            this._fillVisualTree(node.leftLeaf, lvlsList, curDeep + 1);
        }
        if (node.rightLeaf) {
            this._fillVisualTree(node.rightLeaf, lvlsList, curDeep + 1);
        }
    }

    getTreeSchema(): HTMLElement {
        const mainDiv: HTMLElement = document.createElement("div");

        this._lvlsList = this._createLvlsList(this._tree.deep);

        this._fillVisualTree(this._tree.root, this._lvlsList, 0);

        for (const el of this._lvlsList) {
            mainDiv.appendChild(el);
        }

        return mainDiv;
    }
}

let ids: number = 0;
const values: number[] = [3, 10, 1, 7, 2, 9, 11, 8, 6];

const root: MyNode<number> = new MyNode<number>(ids++, 5);
const tree: Tree<number> = new Tree<number>(root);
const treeVisualiser: TreeVisualiser<number> = new TreeVisualiser<number>(tree);

for (const value of values) {
    tree.append(new MyNode<number>(ids++, value));
}

function addNode(): void {
    // @ts-ignore
    const valueNewNode: number = Number.parseInt(document.getElementById("new_node").value, 10);

    tree.append(new MyNode<number>(ids++, valueNewNode));
    treeBlock.innerHTML = "";
    treeBlock.appendChild(treeVisualiser.getTreeSchema());
}

function delNode(): void {
    // @ts-ignore
    const nodeID: number = Number.parseInt(document.getElementById("del_node").value, 10);

    tree.delByID(nodeID, tree.root);
    treeBlock.innerHTML = "";
    treeBlock.appendChild(treeVisualiser.getTreeSchema());
}

function findNode(): void {
    // @ts-ignore
    const nodeID: number = Number.parseInt(document.getElementById("find_node").value, 10);

    const node: MyNode<number> | null = tree.getByID(nodeID, tree.root);

    if (node) {
        let lastSearch: number = 0;
        let curSearch: number = 0;
        for (const lvl of treeVisualiser.lvlsList) {
            // @ts-ignore
            for (const lvlNode of lvl.children) {
                if (lvlNode.textContent.split(":")[0] === node.id.toString(10)) {
                    lvlNode.classList.add("searched");
                    curSearch = 1;
                } else if (lvlNode.classList.contains("searched")){
                    lvlNode.classList.remove("searched");
                    lastSearch = 1;
                }
            }
            if (lastSearch && curSearch) {
                break;
            }
        }
    }
}

window.addEventListener("load", () => {
    treeBlock.appendChild(treeVisualiser.getTreeSchema());
});
