
### JavaScript版本   [参考链接](https://github.com/paljs/create-nexus-type)
1. 执行 npm run dev 生成文件

2. 文件中引入的 SortOrder 变量定义内容如下, 引用位置按项目实际位置修改newSchema.js文件
    ```
    const { enumType } = require('@nexus/schema')
    const SortOrder = enumType({
        name: 'SortOrder',
        members: ['asc', 'desc'],
        description: 'Schema Order By ASC OR DESC',
    });
    ```
#### OutPut 输出内容示例

    ```
    const { inputObjectType, objectType, extendType } = require('@nexus/schema')

    const { SortOrder } = require('../prismaContext/public')

    const User = objectType({
    name: 'User',
    definition(t) {
        t.model.id()
        t.model.createdAt()
        t.model.description()
        t.model.email()
        t.model.expired()
        t.model.name()
        t.model.password()
        t.model.person()
        t.model.rfid()
        t.model.role()
        t.model.status()
        t.model.updatedAt()
        t.model.userGroup()
    },
    })

    const InputType = inputObjectType({
    name: 'UserOrderByInput',
    definition(t) {
        t.field('id', { type: SortOrder })
        t.field('createdAt', { type: SortOrder })
        t.field('description', { type: SortOrder })
        t.field('email', { type: SortOrder })
        t.field('expired', { type: SortOrder })
        t.field('name', { type: SortOrder })
        t.field('password', { type: SortOrder })
        t.field('person', { type: SortOrder })
        t.field('rfid', { type: SortOrder })
        t.field('role', { type: SortOrder })
        t.field('status', { type: SortOrder })
        t.field('updatedAt', { type: SortOrder })
        t.field('userGroup', { type: SortOrder })
    },
    })

    const userAggreType = inputObjectType({
    name: 'userAggreByInput',
    definition(t) {
        t.field('expired', { type: 'Boolean' })
    },
    })

    const userQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('user', {
        type: 'User',
        args: {
            where: 'UserWhereInput',
        },
        async resolve(_root, args, ctx) {
            return await ctx.prisma.user.findOne(args)
        },
        })
        t.list.field('users', {
        type: 'User',
        args: {
            where: 'UserWhereInput',
            orderBy: InputType,
            skip: 'Int',
            first: 'Int',
            last: 'Int',
            before: 'UserWhereUniqueInput',
            after: 'UserWhereUniqueInput',
        },
        async resolve(_root, args, ctx) {
            let argsNew = {
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            cursor: args.before ? args.before : args.after ? args.after : undefined,
            take: args.first ? args.first : args.last ? args.last : undefined,
            }
            return await ctx.prisma.user.findMany(argsNew)
        },
        })

        t.field('usersCount', {
        type: 'Int',
        args: {
            where: 'UserWhereInput',
        },
        async resolve(_root, args, ctx) {
            return ctx.prisma.user.count(args)
        },
        })

        t.list.field('usersConnection', {
        type: 'User',
        args: {
            where: 'UserWhereInput',
            orderBy: InputType,
            skip: 'Int',
            first: 'Int',
            last: 'Int',
            before: 'UserWhereUniqueInput',
            after: 'UserWhereUniqueInput',
        },
        async resolve(_root, args, ctx) {
            let argsNew = {
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            cursor: args.before ? args.before : args.after ? args.after : undefined,
            take: args.first ? args.first : args.last ? args.last : undefined,
            }
            return await ctx.prisma.user.findMany(argsNew)
        },
        })

        t.field('usersAggregate', {
        type: 'Float',
        args: {
            where: 'UserWhereInput',
            orderBy: InputType,
            before: 'UserWhereUniqueInput',
            after: 'UserWhereUniqueInput',
            first: 'Int',
            last: 'Int',
            skip: 'Int',
            avg: userAggreType,
            max: userAggreType,
            min: userAggreType,
            sum: userAggreType,
        },
        async resolve(_root, args, ctx) {
            let argsNew = {
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            cursor: args.before ? args.before : args.after ? args.after : undefined,
            take: args.first ? args.first : args.last ? args.last : undefined,
            min: args.min ? args.min : undefined,
            max: args.max ? args.max : undefined,
            avg: args.avg ? args.avg : undefined,
            sum: args.sum ? args.sum : undefined,
            }
            return ctx.prisma.user.aggregate(argsNew)
        },
        })
    },
    })

    const userMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.crud.createOneUser({
        alias: 'createUser',
        })
        t.crud.updateOneUser({
        alias: 'updateUser',
        })
        t.crud.upsertOneUser({
        alias: 'upsertUser',
        })
        t.crud.deleteOneUser({
        alias: 'deleteUser',
        })

        t.crud.updateManyUser({
        alias: 'updateManyUsers',
        })
        t.crud.deleteManyUser({
        alias: 'deleteManyUsers',
        })
    },
    })
    module.exports = {
    User,
    userQuery,
    userMutation,
    }

    ```